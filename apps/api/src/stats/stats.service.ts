import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      patientsTotal,
      patientsToday,
      bedsTotal,
      bedsOccupied,
      inpatients,
      revenue,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.patient.count({
        where: { tenantId, createdAt: { gte: startOfDay } },
      }),
      this.prisma.bed.count({ where: { tenantId } }),
      this.prisma.bed.count({ where: { tenantId, status: 'OCCUPIED' } }),
      this.prisma.admission.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.payment.groupBy({
        by: ['currency'],
        where: { tenantId, createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
    ]);

    const revenueTodayCdf = Number(
      revenue.find((r) => r.currency === 'CDF')?._sum.amount ?? 0,
    );
    const revenueTodayUsd = Number(
      revenue.find((r) => r.currency === 'USD')?._sum.amount ?? 0,
    );

    return {
      patientsTotal,
      patientsToday,
      bedsTotal,
      bedsOccupied,
      inpatients,
      revenueTodayCdf,
      revenueTodayUsd,
    };
  }
}
