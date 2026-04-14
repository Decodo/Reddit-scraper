# 🤖 Agent Instructions: Monorepo Root

These instructions guide the coding agent when making changes that affect the **entire monorepo structure, shared packages, or cross-application boundaries**. For application-specific changes, refer to the individual `AGENTS.md` files in `apps/frontend` or `apps/backend`.

---

## 1. 📂 Monorepo Structure & Context

This monorepo is composed of three main packages:

- **`apps/frontend`**: The user-facing application built with **React/TypeScript**.
- **`apps/backend`**: The backend API/business logic layer built with **NestJS/TypeScript**.
- **`apps/shared`**: A dedicated package for **reusable types, utilities, and constants** used by both client and server.

### 1.1. Cross-Boundary Changes

The agent **MUST** consider the impact on both `apps/frontend` and `apps/backend` when making changes to:

- **`apps/shared`**: Any change here requires checking for breaking changes in consumer applications.
- **API Contracts**: Updates to DTOs or API endpoints in `apps/backend` must be reflected in the corresponding request/response types and service calls in `apps/frontend`.

### 1.2. Shared Package & Bun Workspaces

This monorepo uses **bun workspaces** for package linking. The shared package (`@platform/shared`) is linked via workspace resolution.

#### How It Works

1. **Root `package.json`** defines workspaces:
   ```json
   { "workspaces": ["apps/*"] }
   ```

2. **Consumer apps** reference the shared package using `workspace:*`:
   ```json
   { "dependencies": { "@platform/shared": "workspace:*" } }
   ```

3. **Bun creates a symlink** at `node_modules/@platform/shared` → `../../apps/shared`.

#### Critical Configuration Rules

| ✅ **DO** | ❌ **DON'T** |
|:---|:---|
| Use `workspace:*` in dependencies | Add TypeScript `references` to tsconfig.json |
| Let TypeScript resolve via node_modules | Add `paths` aliases like `"@platform/shared": ["../shared/src"]` |
| Keep shared package as ESM-only (`type: "module"`) | Add dual CJS/ESM builds |
| Ensure `exports` in shared `package.json` matches actual dist paths | Use `composite: true` in shared tsconfig |

#### Adding New Exports to Shared Package

1. Add types/functions to `apps/shared/src/`
2. Export from `apps/shared/src/index.ts`
3. Run `bun run --cwd apps/shared build` to compile
4. Import in consumer apps: `import { MyType } from '@platform/shared'`

#### Troubleshooting

| Issue | Cause | Fix |
|:---|:---|:---|
| `Cannot find module '@platform/shared'` | Shared package not built | Run `bun run --cwd apps/shared build` |
| Backend outputs to `dist/backend/src/` | TypeScript project references | Remove `references` from backend tsconfig |
| Path mismatch errors | `exports` paths don't match dist structure | Ensure `package.json` exports match actual output |

---

## 2. 🛠️ Self-Validation & Testing

The agent **MUST** execute the necessary build and quality checks **immediately after completing a code modification**.

### 2.1. Mandatory Checks

1. **Build Check**:
   ```bash
   bun build
   ```
2. **Linting/Formatting**:
   ```bash
   bun lint --fix
   ```

> ⚠️ If `bun build` or `bun lint` fails, the agent **MUST** attempt to fix the issues before considering the task complete.

---

## 3. 🧱 Organization & Code Style

### 3.1. Code Organization Principles

- **Feature-First Grouping**: Organize code by **feature**, not by file type.
- **Modularity**: Keep files and modules small and focused on a **single responsibility**.
- **Logic Extraction**: **Prefer extracting logic into separate, pure functions**.

### 3.2. Style & Syntax

| Guideline | Backend (NestJS) | Frontend (React) |
|:---|:---|:---|
| **Exports** | Use `export class`, `export const`, or `export function` | **Always use `export const`** (named exports). **Avoid `export default`** |
| **Functions** | Standard methods; arrow functions for utilities | **Prefer arrow functions** for components, hooks, utilities |
| **Immutability** | Favor `const` | **Strictly favor `const`** |

---

## 4. 📝 Naming Conventions

| Entity | Convention | Example |
|:---|:---|:---|
| **Types/Interfaces** | **PascalCase** | `ItemDTO`, `IAppConfig` |
| **API Resources** | **Plural Nouns** | `items`, `users` |
| **Actions/Methods** | **Verb + Noun** (camelCase) | `getItems`, `createItem` |
| **Variables/Functions** | **camelCase** | `isValid`, `calculateTotal` |

---

## 5. 🛡️ Type Safety & Validation

- **No `any`**: Use specific TypeScript types, generic types, or `unknown` followed by type narrowing.
- **Zod**: Use **Zod schemas** for defining and validating data structures.
- **API Boundaries**: **Mandatory validation at API boundaries**.
- **Shared Types**: Always import types from `@platform/shared` when available.

---

## 6. 📝 Architecture Documentation

The agent must update the architecture documentation when making changes that affect a feature's architecture. Documentation lives in the `docs/` folder.
