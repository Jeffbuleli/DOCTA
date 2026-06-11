import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const slug = 'clinique-demo';
  const passwordHash = await bcrypt.hash('docta1234', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      name: 'Clinique Demo',
      slug,
      city: 'Kinshasa',
      country: 'CD',
      users: {
        create: {
          email: 'admin@docta.cd',
          passwordHash,
          fullName: 'Administrateur Demo',
          role: Role.ADMIN,
        },
      },
      exchangeRates: {
        create: { cdfPerUsd: 2800 },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed OK ->', {
    etablissement: tenant.slug,
    login: { tenantSlug: slug, email: 'admin@docta.cd', password: 'docta1234' },
    tauxDuJour: '1 USD = 2800 CDF',
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
