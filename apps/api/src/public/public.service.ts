import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async hospitals(lat?: number, lng?: number, q?: string) {
    const where: Prisma.TenantWhereInput = { active: true, publicListed: true };
    if (q?.trim()) {
      const s = q.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
      ];
    }

    const tenants = await this.prisma.tenant.findMany({
      where,
      include: { wards: { include: { rooms: { include: { beds: true } } } } },
    });

    const hasGeo = typeof lat === 'number' && typeof lng === 'number';

    const list = tenants.map((tn) => {
      const beds = tn.wards.flatMap((w) => w.rooms.flatMap((r) => r.beds));
      const bedsAvailable = beds.filter((b) => b.status === 'AVAILABLE').length;
      const services = tn.wards.map((w) => w.name);
      const distanceKm =
        hasGeo && tn.latitude != null && tn.longitude != null
          ? Math.round(haversineKm(lat!, lng!, tn.latitude, tn.longitude) * 10) / 10
          : null;
      return {
        slug: tn.slug,
        name: tn.name,
        city: tn.city,
        address: tn.address,
        phone: tn.phone,
        latitude: tn.latitude,
        longitude: tn.longitude,
        bedsTotal: beds.length,
        bedsAvailable,
        services,
        distanceKm,
      };
    });

    // Recommandation : les "capables" (lits libres) d'abord, puis par distance,
    // sinon par nom.
    list.sort((a, b) => {
      const capA = a.bedsAvailable > 0 ? 0 : 1;
      const capB = b.bedsAvailable > 0 ? 0 : 1;
      if (capA !== capB) return capA - capB;
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }
}
