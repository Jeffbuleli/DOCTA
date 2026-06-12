import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caracteres ambigus

function genCode(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private async uniqueCode(
    len: number,
    model: 'linkCode' | 'shareGrant',
  ): Promise<string> {
    for (let i = 0; i < 6; i++) {
      const code = genCode(len);
      const exists =
        model === 'linkCode'
          ? await this.prisma.linkCode.findUnique({ where: { code } })
          : await this.prisma.shareGrant.findUnique({ where: { code } });
      if (!exists) return code;
    }
    throw new Error('Impossible de generer un code unique');
  }

  /** [HOPITAL] Genere un code permettant au patient de rattacher ce dossier. */
  async generateLinkCode(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable');

    const code = await this.uniqueCode(6, 'linkCode');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.linkCode.create({
      data: { tenantId, patientId, code, expiresAt },
    });
    return { code, expiresAt };
  }

  /** [PATIENT] Rattache un dossier hospitalier au compte via un code de liaison. */
  async linkByCode(accountId: string, code: string) {
    const lc = await this.prisma.linkCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!lc || lc.usedAt || lc.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expire');
    }

    await this.prisma.$transaction([
      this.prisma.accountPatientLink.upsert({
        where: {
          accountId_patientId: { accountId, patientId: lc.patientId },
        },
        update: {},
        create: { accountId, patientId: lc.patientId },
      }),
      this.prisma.linkCode.update({
        where: { id: lc.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { linked: true };
  }

  /** Construit le resume medical (multi-hopitaux) d'un compte. */
  private async buildSummary(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    const links = await this.prisma.accountPatientLink.findMany({
      where: { accountId },
      include: {
        patient: {
          include: {
            tenant: true,
            admissions: {
              orderBy: { admittedAt: 'desc' },
              include: { ward: true, bed: { include: { room: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const records = links.map((l) => ({
      hospital: l.patient.tenant.name,
      city: l.patient.tenant.city,
      mrn: l.patient.mrn,
      patient: {
        firstName: l.patient.firstName,
        lastName: l.patient.lastName,
        sex: l.patient.sex,
        birthDate: l.patient.birthDate,
        phone: l.patient.phone,
      },
      admissions: l.patient.admissions.map((a) => ({
        ward: a.ward.name,
        bed: a.bed.label,
        reason: a.reason,
        status: a.status,
        admittedAt: a.admittedAt,
        dischargedAt: a.dischargedAt,
      })),
    }));

    return {
      account: account
        ? { fullName: account.fullName, email: account.email }
        : null,
      records,
    };
  }

  /** [PATIENT] Liste les dossiers rattaches + historique. */
  listRecords(accountId: string) {
    return this.buildSummary(accountId);
  }

  /** [PATIENT] Cree un code de partage temporaire de son dossier. */
  async createShare(accountId: string) {
    const code = await this.uniqueCode(8, 'shareGrant');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.shareGrant.create({
      data: { accountId, code, expiresAt },
    });
    return { code, expiresAt };
  }

  /** [HOPITAL] Consulte un dossier partage via un code (avec journal d'audit). */
  async redeemShare(code: string, tenantId: string, userId: string) {
    const grant = await this.prisma.shareGrant.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!grant || grant.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expire');
    }
    // Journal d'acces (audit) : qui a consulte, et quand.
    await this.prisma.shareAccess.create({
      data: { grantId: grant.id, tenantId, userId },
    });
    return this.buildSummary(grant.accountId);
  }
}
