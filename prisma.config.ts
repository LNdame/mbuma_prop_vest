import { loadEnv } from "./lib/load-env";
import { defineConfig, env } from "prisma/config";

// Load the environment-specific `.env.<APP_ENV>` file (defaults to development)
// so Prisma CLI commands target the correct database. Select with, e.g.:
//   APP_ENV=staging    npx prisma migrate deploy
//   APP_ENV=production npx prisma migrate deploy
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
