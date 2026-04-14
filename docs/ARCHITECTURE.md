# Architecture

## Overview

This platform is a monorepo containing a React frontend, NestJS backend, and a shared TypeScript package.

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│              React App (port 5274)                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP /api/*
┌──────────────────────▼──────────────────────────────┐
│              NestJS Backend (port 5002)             │
│                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Features   │  │ Shared   │  │  Config       │  │
│  │  (items,    │  │ (DB,     │  │  Service      │  │
│  │   ...)      │  │  Redis)  │  │               │  │
│  └─────────────┘  └──────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼───────┐           ┌─────────▼─────────┐
│   MongoDB     │           │      Redis          │
│  (port 27018) │           │   (port 6378)       │
└───────────────┘           └─────────────────────┘
```

## Frontend Architecture

- **Router**: TanStack Router with file-based routing (`src/routes/`)
- **Data Fetching**: TanStack Query with Axios client (`src/lib/api.ts`)
- **UI**: Radix UI primitives + TailwindCSS v4 design tokens
- **State**: React Query cache + local component state

## Backend Architecture

- **Framework**: NestJS with feature modules
- **Database**: MongoDB via Mongoose
- **Queue**: BullMQ + Redis for background jobs
- **Config**: Environment-based via `ConfigService`

## Data Flow

1. Frontend makes HTTP request via `src/lib/api.ts` (Axios)
2. Dev: Rsbuild proxies `/api/*` → backend port 5002
3. Backend validates request (ValidationPipe + class-validator)
4. Feature service handles business logic
5. Data persisted to MongoDB

## Adding New Features

See [README.md](../README.md) for step-by-step instructions.
