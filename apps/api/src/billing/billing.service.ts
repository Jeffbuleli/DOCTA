import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, CreatePaymentDto } from './dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Taux du jour (CDF pour 1 USD). */
  private async latestRate(tenantId: string): Promise<number> {
    const r = await this.prisma.exchangeRate.findFirst({
      where: { tenantId },
      orderBy: { date: 'desc' },
    });
    if (!r) {
      throw new BadRequestException(
        "Aucun taux de change defini. Definir d'abord le taux du jour.",
      );
    }
    return Number(r.cdfPerUsd);
  }

  /** Convertit un montant d'une devise vers une autre au taux donne. */
  private convert(
    amount: number,
    from: Currency,
    to: Currency,
    cdfPerUsd: number,
  ): number {
    if (from === to) return amount;
    if (from === 'USD' && to === 'CDF') return amount * cdfPerUsd;
    return cdfPerUsd ? amount / cdfPerUsd : 0; // CDF -> USD
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  list(tenantId: string, status?: InvoiceStatus, search?: string) {
    const where: Prisma.InvoiceWhereInput = { tenantId };
    if (status) where.status = status;
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { number: { contains: q, mode: 'insensitive' } },
        { patient: { lastName: { contains: q, mode: 'insensitive' } } },
        { patient: { firstName: { contains: q, mode: 'insensitive' } } },
        { patient: { mrn: { contains: q, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { patient: true },
    });
  }

  async get(tenantId: string, id: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        items: true,
        payments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!inv) throw new NotFoundException('Facture introuvable');
    return inv;
  }

  async create(tenantId: string, dto: CreateInvoiceDto) {
    if (dto.patientId) {
      const p = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!p) throw new NotFoundException('Patient introuvable');
    }

    const items = dto.items.map((it) => ({
      label: it.label.trim(),
      quantity: it.quantity,
      unitPrice: this.round2(it.unitPrice),
      amount: this.round2(it.quantity * it.unitPrice),
    }));
    const total = this.round2(items.reduce((s, it) => s + it.amount, 0));

    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const number = `INV${String(count + 1).padStart(5, '0')}`;

    return this.prisma.invoice.create({
      data: {
        tenantId,
        number,
        patientId: dto.patientId,
        currency: dto.currency,
        total,
        items: { create: items },
      },
      include: { patient: true, items: true, payments: true },
    });
  }

  /** Enregistre un paiement (converti dans la devise de la facture) et met a jour le statut. */
  async addPayment(tenantId: string, invoiceId: string, dto: CreatePaymentDto) {
    const cdfPerUsd = await this.latestRate(tenantId);

    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.findFirst({
        where: { id: invoiceId, tenantId },
      });
      if (!inv) throw new NotFoundException('Facture introuvable');
      if (inv.status === 'CANCELLED')
        throw new BadRequestException('Facture annulee');

      const amountInvoice = this.round2(
        this.convert(dto.amount, dto.currency, inv.currency, cdfPerUsd),
      );

      await tx.payment.create({
        data: {
          tenantId,
          invoiceId,
          method: dto.method,
          currency: dto.currency,
          amount: this.round2(dto.amount),
          cdfPerUsd,
          amountInvoice,
          reference: dto.reference?.trim(),
        },
      });

      const paid = this.round2(Number(inv.paid) + amountInvoice);
      const total = Number(inv.total);
      const status: InvoiceStatus =
        paid + 0.001 >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';

      return tx.invoice.update({
        where: { id: invoiceId },
        data: { paid, status },
        include: {
          patient: true,
          items: true,
          payments: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }
}
