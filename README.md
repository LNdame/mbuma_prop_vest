# Mbuma Prop Vest

A TypeScript monorepo using npm workspaces.

```
.
├── shared/     # @mbuma/shared — types shared by frontend & backend (single source of truth)
├── backend/    # @mbuma/backend — Node.js + Express API
└── frontend/   # @mbuma/frontend — Next.js (App Router) app
```

Both apps import data shapes from `@mbuma/shared`, so the API contract can never drift.

## Setup

```bash
npm install          # installs all workspaces
npm run build:shared # compile shared types (needed before type-checking apps)
```

## Develop

```bash
npm run dev:backend   # Express on http://localhost:4000
npm run dev:frontend  # Next.js on http://localhost:3000
```

## Quality

```bash
npm run lint        # ESLint across all workspaces
npm run format      # Prettier write
npm run typecheck   # tsc --noEmit across all workspaces
npm run build       # build shared + backend + frontend
```

## Tooling

- **TypeScript** — shared `tsconfig.base.json`, extended per package.
- **ESLint** — flat config (`eslint.config.js`) for shared/backend; `next lint` for frontend. Prettier conflicts disabled via `eslint-config-prettier`.
- **Prettier** — root `.prettierrc.json` applies to every package.
