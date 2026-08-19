import { loadEnv } from "./load-env";
import { PrismaClient } from "../backend/src/generated/prisma/client";

loadEnv();
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});
