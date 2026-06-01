import { prisma } from "../lib/prisma";

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      posts: {
        create: [
          { title: "First post", content: "Hello from Alice!" },
          { title: "Second post", content: "More Prisma setup content." },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      posts: {
        create: [{ title: "Bob's post", content: "This is Bob's first contribution." }],
      },
    },
  });

  console.log(`Seeded users and posts: ${alice.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
