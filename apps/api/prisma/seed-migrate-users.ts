import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration identite-unique : chaque User (personnel par hopital) devient
 * un Account (identite globale) + un Membership ACTIVE dans son hopital.
 * Idempotent : peut etre relance sans creer de doublons.
 */
async function main() {
  const users = await prisma.user.findMany();
  let accounts = 0;
  let memberships = 0;

  for (const u of users) {
    const email = u.email.toLowerCase();

    let account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      account = await prisma.account.create({
        data: {
          email,
          passwordHash: u.passwordHash, // meme hash bcrypt -> meme mot de passe
          fullName: u.fullName,
          emailVerified: true,
        },
      });
      accounts++;
    }

    const existing = await prisma.membership.findFirst({
      where: { accountId: account.id, tenantId: u.tenantId },
    });
    if (!existing) {
      await prisma.membership.create({
        data: {
          accountId: account.id,
          tenantId: u.tenantId,
          role: u.role,
          status: 'ACTIVE',
          startDate: u.createdAt,
        },
      });
      memberships++;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Migration OK : ${accounts} compte(s) cree(s), ${memberships} appartenance(s) creee(s) sur ${users.length} User(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
