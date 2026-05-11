# Decodo Reddit Tracker

An open-source Reddit intelligence tool powered by the [Decodo Scraping API](https://decodo.com/scraping/web). Enter any topic, get an AI-generated intelligence report from across Reddit — themes, sentiment, quotes, and top posts.

---

## How it works

1. **Enter a topic** — e.g. _"What do developers think about AI coding tools?"_
2. **Review the scraping plan** — the LLM suggests subreddits and search queries; you can edit before running
3. **Get your report** — Decodo scrapes Reddit, the LLM summarizes findings into a structured report
4. **Export** — download as Markdown or JSON

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2.5
- [Docker](https://docker.com) (for local MongoDB + Redis)
- A **Decodo API key** — sign up at [decodo.com](https://dashboard.decodo.com/register?page=scrapers/pricing)
- At least one LLM API key: **Anthropic**, **OpenAI**, or **Google Gemini**

- **Just installed Bun?** Open a new terminal (or run `source ~/.zshrc` on zsh / `source ~/.bashrc` on bash) so the `bun` command is on your PATH before running `bun install`.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Decodo/Reddit-tracker
cd reddit-tracker
bun install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your API keys (see Configuration below)

# 3. Start databases
bun db:up

# 4. Start dev servers
bun dev
```

Frontend: http://localhost:5274  
Backend API: http://localhost:5002

---

## Configuration

API keys can be set in two ways:

**Option A — `.env` file** (recommended for local dev)

```env
# Decodo Scraping API
DECODO_BASIC_AUTH_TOKEN=your_decodo_token

# LLM provider (claude | openai | gemini)
LLM_PROVIDER=claude
LLM_MODEL=                        # leave blank for default

# LLM API keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

---

## Scripts

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `bun dev`     | Start frontend + backend in watch mode   |
| `bun build`   | Build all packages                       |
| `bun lint`    | Lint all packages                        |
| `bun db:up`   | Start MongoDB + Redis via Docker Compose |
| `bun db:down` | Stop databases                           |

---

## Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, TanStack Router, TanStack Query, Tailwind v4, Radix UI |
| Backend  | NestJS 11, MongoDB (Mongoose)                                    |
| Scraping | Decodo Scraping API                                              |
| LLMs     | Anthropic Claude (default), OpenAI GPT, Google Gemini            |

---

## Project Structure

```
apps/
  frontend/         # React app (Rsbuild + TanStack Router)
    src/
      features/
        tracker/    # Prompt form, plan review, report view, API hooks
        queries/    # History API hooks
        settings/   # Settings API hooks
      routes/
        _layout/
          tracker.tsx   # Main 3-step flow
          history.tsx   # Past queries list
          history.$id   # Single query result
          settings.tsx  # API key configuration
  backend/
    src/
      features/
        tracker/    # POST /tracker/plan, POST /tracker/analyze
        decodo/     # Decodo API wrapper (3 target types)
        llm/        # LLM abstraction (Claude / OpenAI / Gemini)
        queries/    # Query history CRUD
        settings/   # Runtime API key/provider config
  shared/           # Shared TypeScript types
docs/
  ARCHITECTURE.md
```

---

## API Endpoints

| Method | Path             | Description                                    |
| ------ | ---------------- | ---------------------------------------------- |
| POST   | /tracker/plan    | Generate LLM scraping plan from a prompt       |
| POST   | /tracker/analyze | Execute plan, scrape Reddit, return report     |
| GET    | /queries         | List past query history (no raw posts)         |
| GET    | /queries/:id     | Full query result including posts              |
| DELETE | /queries/:id     | Delete a query from history                    |
| GET    | /settings        | Current config status (key presence, provider) |
| PATCH  | /settings        | Update API keys or LLM provider                |

---

## Scraping Strategy

Three Decodo target types are used per analysis:

| Step | Target             | Purpose                                    |
| ---- | ------------------ | ------------------------------------------ |
| 1    | `universal`        | Global Reddit search across all subreddits |
| 2    | `reddit_subreddit` | Hot posts from specific subreddits         |
| 3    | `reddit_post`      | Full comment threads for deep analysis     |

The LLM generates 3–8 subreddits and 2–5 search queries from the user's prompt. Up to 30 posts are collected (deduped and ranked by upvotes), then the top 8 are fetched with full comments before LLM summarization.

---

## License

MIT — see [LICENSE](LICENSE)
