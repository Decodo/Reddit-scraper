# Platform Boilerplate

A monorepo boilerplate with React frontend, NestJS backend, and shared TypeScript package.

## Stack

- **Frontend**: React 19, TanStack Router, TanStack Query, TailwindCSS v4, Radix UI, Rsbuild
- **Backend**: NestJS 11, MongoDB (Mongoose), Redis, BullMQ
- **Shared**: TypeScript ESM package with shared types
- **Package Manager**: Bun

## Prerequisites

- [Bun](https://bun.sh) >= 1.2.5
- [Docker](https://docker.com) (for local databases)

## Getting Started

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Start databases
bun db:up

# 3. Install dependencies
bun install

# 4. Start dev servers (frontend + backend)
bun dev
```

Frontend runs at: http://localhost:5274
Backend runs at: http://localhost:5002

## Scripts

| Command       | Description                      |
| ------------- | -------------------------------- |
| `bun dev`     | Start all dev servers            |
| `bun build`   | Build all packages               |
| `bun lint`    | Lint all packages                |
| `bun db:up`   | Start MongoDB + Redis via Docker |
| `bun db:down` | Stop databases                   |

## Project Structure

```
apps/
  frontend/     # React app (Rsbuild + TanStack Router)
  backend/      # NestJS API
  shared/       # Shared TypeScript types and utilities
docs/           # Architecture documentation
```

## Adding a New Feature

### Backend

1. Create `apps/backend/src/features/<feature>/`
2. Add `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.schema.ts`
3. Register module in `app.module.ts`

### Frontend

1. Create `apps/frontend/src/features/<feature>/`
2. Add API hooks in `api/use<Feature>Api.ts`
3. Add route in `apps/frontend/src/routes/_layout/<feature>.tsx`

### Shared Types

1. Add types to `apps/shared/src/types/`
2. Export from `apps/shared/src/index.ts`
3. Run `bun run --cwd apps/shared build`
