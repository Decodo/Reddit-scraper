# Architecture

## Overview

Decodo Forum Scraper is a monorepo with a React frontend, NestJS backend, and shared TypeScript package.

```
┌──────────────────────────────────────────────────────────┐
│                     Browser (port 5274)                  │
│   TanStack Router · TanStack Query · Tailwind v4         │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP /api/*  (proxied by Rsbuild in dev)
┌─────────────────────────▼────────────────────────────────┐
│                 NestJS Backend (port 5002)                │
│                                                          │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐  │
│  │ tracker  │  │ decodo │  │   llm    │  │ queries  │  │
│  │ (plan +  │  │ (scrape│  │ (Claude/ │  │ (history │  │
│  │  analyze)│  │  API)  │  │  OpenAI/ │  │  CRUD)   │  │
│  └────┬─────┘  └───┬────┘  │  Gemini) │  └──────────┘  │
│       │             │       └──────────┘                 │
│       └─────────────┴─────────────────────────────────── │
│                         settings (runtime config)        │
└──────────────────────────────┬───────────────────────────┘
                               │
              ┌────────────────┴───────────────┐
              │                                │
  ┌───────────▼───────────┐       ┌────────────▼──────────┐
  │   MongoDB (port 27018) │       │   Redis (port 6378)    │
  │   queries, settings    │       │   BullMQ queue         │
  └───────────────────────┘       └───────────────────────┘
```

External APIs:
- **Decodo Scraping API** — `https://scraper-api.decodo.com/v2/scrape`
- **Anthropic API** — default LLM provider
- **OpenAI API** — optional LLM provider
- **Google Gemini API** — optional LLM provider

---

## Request Flow

### POST /tracker/plan
1. `TrackerController` receives `{ prompt, subreddits?, timeRange? }`
2. `TrackerService.generatePlan()` calls `LlmService.complete()` with `SCRAPING_PLAN_PROMPT`
3. `LlmService` reads effective config from `SettingsService` (DB overrides .env)
4. LLM returns JSON: `{ subreddits[], queries[], timeRange, rationale }`
5. Response returned to frontend for user review

### POST /tracker/analyze
1. `TrackerController` receives confirmed plan `{ prompt, subreddits[], queries[], timeRange }`
2. `TrackerService.analyzePlan()`:
   a. **Parallel search** — site-wide Reddit search queries via `universal` target (no subreddit hot-feed scraping)
   b. **Dedup & rank** — keep only on-topic posts (topic terms from queries + proper nouns), sort by relevance × upvotes, cap at 30
   c. **Deep dive** — fetch full comment threads for top 8 posts via `reddit_post` target (concurrent)
   d. **LLM summarization** — send all content to LLM with `SUMMARIZATION_PROMPT`
   e. **Persist** — save full result to MongoDB via `QueriesService`
3. Response: `{ id, plan, posts[], report }`

---

## Feature Modules

### `tracker`
Orchestrates the full pipeline. No database access — delegates to `DecodoService`, `LlmService`, and `QueriesService`.

### `decodo`
Wraps the Decodo Scraping API. Provides three typed methods:
- `searchReddit(params)` — `universal` target + `headless: html`, Reddit search JSON endpoint
- `scrapeSubreddit(params)` — `universal` target + `headless: html`, subreddit hot feed via `/hot.json`
- `scrapePost(params)` — `universal` target + `headless: html`, full comment thread via `.json` endpoint

Parses the JSON response from Reddit's `.json` endpoints into typed `RedditPost` / `RedditPostWithComments` objects.

### `llm`
Thin abstraction over three providers. Provider and model are resolved from `SettingsService.getEffectiveConfig()` on each call (DB settings override .env fallback). Supports `responseFormat: 'json'` hint (activates OpenAI's JSON mode; Claude/Gemini rely on prompt engineering).

### `queries`
MongoDB CRUD for query history. `findAll()` excludes raw `posts` field to keep list responses lightweight. Full posts are available via `findOne(id)`.

### `settings`
Single MongoDB document (`key: 'global'`) stores runtime config overrides. `getEffectiveConfig()` merges DB values over env vars. API keys are never returned in responses — only boolean `*KeySet` flags.

---

## Frontend Architecture

### Routing
File-based routing via TanStack Router plugin. Routes:
- `/_layout/tracker` — 3-step flow: prompt → plan review → report
- `/_layout/history` — past queries list
- `/_layout/history/$id` — single query detail (reuses `ReportView`)
- `/_layout/settings` — API key and provider configuration

### State Management
- Server state: TanStack Query (cache, mutations, invalidation)
- UI flow state: local `useState` in `TrackerPage` (step state machine)
- No global client state library needed

### Tracker Flow State Machine
```
'input'
   │  generatePlan.mutate()
   ▼
'reviewing'  ←─── analyzePlan.isError (stays in review)
   │  analyzePlan.mutate() → isPending shows AnalyzingState
   ▼
'done'
```

### API Layer
All API calls go through `src/lib/api.ts` (Axios instance with `/api` base URL). In development, Rsbuild proxies `/api/*` to the backend. Feature API hooks live in `src/features/<feature>/api/`.
