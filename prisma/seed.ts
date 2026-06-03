import { scryptSync, randomBytes } from "crypto";
import { prisma } from "../lib/prisma.js";

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "investor@propvest.dev",
      passwordHash: hashPassword("Investor@123"),
      fullName: "Seed Investor",
      role: "investor",
      kycStatus: "pending",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@propvest.dev",
      passwordHash: hashPassword("Admin@123"),
      fullName: "Seed Administrator",
      role: "admin",
      kycStatus: "approved",
    },
  });

  console.log("Seeded: investor@propvest.dev (role=investor), admin@propvest.dev (role=admin)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
