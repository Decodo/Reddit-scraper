# Decodo Reddit Tracker

## What this project is

Open-source Reddit intelligence tool. User enters a topic, we scrape Reddit via Decodo API, LLM summarizes findings.

## Tech stack

- Frontend: React 19 + TanStack Router + TanStack Query + Tailwind v4 + Radix UI
- Backend: NestJS 11 + MongoDB + Redis + BullMQ
- Package manager: Bun

## Key APIs

- Decodo Scraping API: POST https://scraper-api.decodo.com/v2/scrape
- Anthropic Claude API: @anthropic-ai/sdk
- OpenAI API: openai package
- Google Gemini: @google/genai

## Architecture

See docs/ARCHITECTURE.md

## Requirements

See Confluence: https://datatroops.atlassian.net/wiki/spaces/SPRD/pages/1873117254
