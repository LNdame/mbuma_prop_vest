import { config as loadDotenv } from "dotenv";

/**
 * Loads the environment-specific `.env` file into `process.env`.
 *
 * Selection order:
 *   1. APP_ENV   (explicit, preferred — e.g. `APP_ENV=staging`)
 *   2. NODE_ENV  (fallback)
 *   3. "development" (default)
 *
 * The matching `.env.<env>` file is loaded (resolved from the current working
 * directory, i.e. the repo root). If it is missing we fall back to a plain
 * `.env` so local/legacy setups keep working. Real environment variables that
 * are already set (e.g. injected by Railway in production) always win, because
 * dotenv never overwrites existing `process.env` values.
 *
 * Used by the Prisma tooling entry points (prisma.config.ts, seed, scripts).
 * The backend runtime loads its env via Node's `--env-file` flag instead — see
 * backend/package.json.
 */
export function loadEnv(): string {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
  const result = loadDotenv({ path: `.env.${appEnv}` });
  if (result.error) {
    // No env-specific file present — fall back to a bare `.env` if it exists.
    loadDotenv();
  }
  return appEnv;
}
