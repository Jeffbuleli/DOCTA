import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Definit le taux du jour : combien de CDF pour 1 USD. */
  async setRate(tenantId: string, cdfPerUsd: number) {
    return this.prisma.exchangeRate.create({
      data: { tenantId, cdfPerUsd },
    });
  }

  /** Taux le plus recent pour le tenant. */
  async latest(tenantId: string) {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { tenantId },
      orderBy: { date: 'desc' },
    });
    if (!rate) {
      throw new NotFoundException(
        "Aucun taux de change defini. Definir d'abord le taux du jour.",
      );
    }
    return rate;
  }

  /** Convertit un montant USD -> CDF et CDF -> USD au taux courant. */
  async convert(tenantId: string, amount: number, from: 'USD' | 'CDF') {
    const rate = await this.latest(tenantId);
    const cdfPerUsd = Number(rate.cdfPerUsd);
    if (from === 'USD') {
      return { from, amount, cdfPerUsd, usd: amount, cdf: amount * cdfPerUsd };
    }
    return {
      from,
      amount,
      cdfPerUsd,
      cdf: amount,
      usd: cdfPerUsd ? amount / cdfPerUsd : 0,
    };
  }
}
