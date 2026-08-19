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

## Environments & databases

Each environment uses its **own separate database** — never point staging or
production at another environment's DB.

| Environment | Env file          | Committed?           |
| ----------- | ----------------- | -------------------- |
| development | `.env.development`| No (git-ignored)     |
| staging     | `.env.staging`    | No (git-ignored)     |
| production  | `.env.production` | No (git-ignored)     |
| template    | `.env.example`    | Yes (no secrets)     |

Copy the template and fill in real values per environment:

```bash
cp .env.example .env.staging     # then edit DATABASE_URL, JWT_SECRET, storage…
```

The environment is selected by `APP_ENV` (falls back to `NODE_ENV`, then
`development`). The backend runtime loads its file via Node's `--env-file`
flag; Prisma tooling loads it via `lib/load-env.ts`.

```bash
# Run the API against a specific environment's DB
npm run dev:backend               # development
npm run dev:staging --workspace backend
npm run dev:prod --workspace backend

# Migrations (each targets that environment's DB)
npm run db:migrate:dev            # create + apply a dev migration
npm run db:migrate:deploy:staging # apply pending migrations to staging
npm run db:migrate:deploy:prod    # apply pending migrations to production

# Seed / Prisma Studio
npm run seed:staging
npm run db:studio:prod
```

On Railway, set the same variables as service variables in the dashboard for
each service — the deployed runtime reads those, not the `.env.production` file.

## Tooling

- **TypeScript** — shared `tsconfig.base.json`, extended per package.
- **ESLint** — flat config (`eslint.config.js`) for shared/backend; `next lint` for frontend. Prettier conflicts disabled via `eslint-config-prettier`.
- **Prettier** — root `.prettierrc.json` applies to every package.
