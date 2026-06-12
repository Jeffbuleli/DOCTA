import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface HSpec {
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  wards: { name: string; beds: number; occupied: number }[];
}

const HOSPITALS: HSpec[] = [
  {
    name: 'Clinique Demo',
    slug: 'clinique-demo',
    city: 'Kinshasa',
    address: 'Av. de la Justice, Gombe',
    phone: '+243 810 000 001',
    latitude: -4.3017,
    longitude: 15.3136,
    wards: [],
  },
  {
    name: 'Hopital General de Kinshasa',
    slug: 'hgr-kinshasa',
    city: 'Kinshasa',
    address: 'Av. Tombalbaye, Gombe',
    phone: '+243 820 111 222',
    latitude: -4.325,
    longitude: 15.322,
    wards: [
      { name: 'Medecine interne', beds: 12, occupied: 9 },
      { name: 'Chirurgie', beds: 8, occupied: 2 },
      { name: 'Maternite', beds: 6, occupied: 1 },
    ],
  },
  {
    name: 'Centre Medical de Goma',
    slug: 'cm-goma',
    city: 'Goma',
    address: 'Av. du Lac, Himbi',
    phone: '+243 991 333 444',
    latitude: -1.6794,
    longitude: 29.2336,
    wards: [
      { name: 'Pediatrie', beds: 10, occupied: 4 },
      { name: 'Urgences', beds: 6, occupied: 6 },
    ],
  },
  {
    name: 'Polyclinique de Lubumbashi',
    slug: 'poly-lubumbashi',
    city: 'Lubumbashi',
    address: 'Av. Mobutu, Centre-ville',
    phone: '+243 970 555 666',
    latitude: -11.6647,
    longitude: 27.4794,
    wards: [
      { name: 'Maternite', beds: 8, occupied: 3 },
      { name: 'Medecine interne', beds: 10, occupied: 7 },
    ],
  },
];

async function ensureHospital(h: HSpec) {
  const existing = await prisma.tenant.findUnique({ where: { slug: h.slug } });

  const tenant = existing
    ? await prisma.tenant.update({
        where: { slug: h.slug },
        data: {
          city: h.city,
          address: h.address,
          phone: h.phone,
          latitude: h.latitude,
          longitude: h.longitude,
          publicListed: true,
        },
      })
    : await prisma.tenant.create({
        data: {
          name: h.name,
          slug: h.slug,
          city: h.city,
          address: h.address,
          phone: h.phone,
          latitude: h.latitude,
          longitude: h.longitude,
          users: {
            create: {
              email: `admin@${h.slug}.cd`,
              passwordHash: await bcrypt.hash('docta1234', 10),
              fullName: `Admin ${h.name}`,
              role: Role.ADMIN,
            },
          },
        },
      });

  // Cree les services/lits seulement s'il n'y en a pas encore.
  const wardCount = await prisma.ward.count({ where: { tenantId: tenant.id } });
  if (wardCount === 0 && h.wards.length > 0) {
    for (const w of h.wards) {
      const ward = await prisma.ward.create({
        data: { tenantId: tenant.id, name: w.name },
      });
      const room = await prisma.room.create({
        data: { tenantId: tenant.id, wardId: ward.id, name: w.name },
      });
      for (let i = 0; i < w.beds; i++) {
        await prisma.bed.create({
          data: {
            tenantId: tenant.id,
            roomId: room.id,
            label: `${w.name}-${i + 1}`,
            status: i < w.occupied ? 'OCCUPIED' : 'AVAILABLE',
          },
        });
      }
    }
  }
  return tenant.slug;
}

async function main() {
  for (const h of HOSPITALS) {
    const slug = await ensureHospital(h);
    // eslint-disable-next-line no-console
    console.log('hopital OK ->', slug);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
