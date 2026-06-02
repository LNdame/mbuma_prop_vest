import { prisma } from "../lib/prisma";

/**
 * Seed: two fictional users
 *   - Thabo Nkosi    | investor | investor@propvest.dev | password: Investor@123
 *   - Zanele Dlamini | admin    | admin@propvest.dev    | password: Admin@123
 *
 * Passwords hashed with crypto.scrypt (see backend/src/lib/password.ts)
 */
async function main() {
  // Idempotent — only touch the seed accounts
  await prisma.user.deleteMany({
    where: { email: { in: ['investor@propvest.dev', 'admin@propvest.dev'] } },
  });

  const investor = await prisma.user.create({
    data: {
      email: 'investor@propvest.dev',
      // password: Investor@123
      passwordHash:
        '802368a12fb6b8a930576388e372bb75f6f684bdb8dd4eb80cc1737e778460e9214b10f04e5fa69711a39c5378d714803dbe9952708fe9c7a1ae52dfe18f1a0b.a918a2298901ac01507512db9b609f67',
      fullName: 'Thabo Nkosi',
      phone: '+27 82 111 2233',
      role: 'investor',
      kycStatus: 'approved',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@propvest.dev',
      // password: Admin@123
      passwordHash:
        '0cd2b2d70cd8954c22b0929fd12786622f6e4396bb8af4a43fb934c35edb3a8a6c90d66f198bcba3300a890e9f7429d27bef172d9922eac80e701c1441be1e30.ec2d69fe6375251b3e7de01e1dbdcd14',
      fullName: 'Zanele Dlamini',
      phone: '+27 83 444 5566',
      role: 'admin',
      kycStatus: 'approved',
      isActive: true,
    },
  });

  console.log('✅ Seeded users:');
  console.log(`   investor: ${investor.email}  (password: Investor@123)`);
  console.log(`   admin:    ${admin.email}     (password: Admin@123)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
