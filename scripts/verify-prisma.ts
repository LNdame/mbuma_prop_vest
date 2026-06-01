import { prisma } from "../lib/prisma";

async function main() {
  try {
    const one = await prisma.user.findFirst();
    console.log("✅ Connected");
    console.log({ one });
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
