import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Medecins actifs d'un hopital (pour la prise de RDV cote patient). */
  async doctorsOfHospital(tenantId: string) {
    const members = await this.prisma.membership.findMany({
      where: { tenantId, role: Role.DOCTOR, status: 'ACTIVE', accountId: { not: null } },
      include: { account: { select: { id: true, fullName: true } } },
    });
    return members.map((m) => ({
      accountId: m.account!.id,
      fullName: m.account!.fullName,
      title: m.title,
    }));
  }

  /** [PATIENT] Mes rendez-vous. */
  listForPatient(accountId: string) {
    return this.prisma.appointment.findMany({
      where: { accountId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, city: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    });
  }

  /** [PATIENT] Prend un rendez-vous. */
  async book(accountId: string, dto: CreateAppointmentDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: dto.tenantId, active: true },
    });
    if (!tenant) throw new NotFoundException('Hopital introuvable');

    if (dto.doctorAccountId) {
      const doc = await this.prisma.membership.findFirst({
        where: {
          tenantId: dto.tenantId,
          accountId: dto.doctorAccountId,
          role: Role.DOCTOR,
          status: 'ACTIVE',
        },
      });
      if (!doc) throw new BadRequestException("Ce medecin n'exerce pas dans cet hopital");
    }

    return this.prisma.appointment.create({
      data: {
        tenantId: dto.tenantId,
        accountId,
        doctorAccountId: dto.doctorAccountId,
        reason: dto.reason?.trim(),
        scheduledAt: new Date(dto.scheduledAt),
        online: dto.online ?? false,
      },
      include: {
        tenant: { select: { id: true, name: true, city: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    });
  }

  /** [PATIENT] Annule son rendez-vous. */
  async cancelByPatient(accountId: string, id: string) {
    const appt = await this.prisma.appointment.findFirst({ where: { id, accountId } });
    if (!appt) throw new NotFoundException('Rendez-vous introuvable');
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /** [HOPITAL] Rendez-vous de l'etablissement. */
  listForTenant(tenantId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        account: { select: { id: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    });
  }

  /** [HOPITAL] Change le statut d'un rendez-vous. */
  async setStatus(tenantId: string, id: string, status: AppointmentStatus) {
    const appt = await this.prisma.appointment.findFirst({ where: { id, tenantId } });
    if (!appt) throw new NotFoundException('Rendez-vous introuvable');
    return this.prisma.appointment.update({ where: { id }, data: { status } });
  }
}
