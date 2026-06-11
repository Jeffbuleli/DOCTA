import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdmitDto, CreateWardDto } from './dto';

@Injectable()
export class HospitalService {
  constructor(private readonly prisma: PrismaService) {}

  /** Services avec compteurs d'occupation des lits. */
  async listWards(tenantId: string) {
    const wards = await this.prisma.ward.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      include: { rooms: { include: { beds: true } } },
    });
    return wards.map((w) => {
      const beds = w.rooms.flatMap((r) => r.beds);
      const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
      const maintenance = beds.filter((b) => b.status === 'MAINTENANCE').length;
      return {
        id: w.id,
        name: w.name,
        total: beds.length,
        occupied,
        available: beds.length - occupied - maintenance,
        maintenance,
      };
    });
  }

  /** Lits libres (optionnellement filtres par service), avec libelles. */
  async availableBeds(tenantId: string, wardId?: string) {
    const beds = await this.prisma.bed.findMany({
      where: {
        tenantId,
        status: 'AVAILABLE',
        room: wardId ? { wardId } : undefined,
      },
      include: { room: { include: { ward: true } } },
      orderBy: { label: 'asc' },
    });
    return beds.map((b) => ({
      id: b.id,
      label: b.label,
      roomName: b.room.name,
      wardId: b.room.wardId,
      wardName: b.room.ward.name,
    }));
  }

  /** Patients actuellement hospitalises. */
  listActiveAdmissions(tenantId: string) {
    return this.prisma.admission.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: { admittedAt: 'desc' },
      include: {
        patient: true,
        ward: true,
        bed: { include: { room: true } },
      },
    });
  }

  /** Cree un service avec ses salles et lits (provisionnement rapide). */
  async createWard(tenantId: string, dto: CreateWardDto) {
    return this.prisma.ward.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        rooms: {
          create: (dto.rooms ?? []).map((r) => ({
            tenantId,
            name: r.name.trim(),
            beds: {
              create: Array.from({ length: r.beds }, (_, i) => ({
                tenantId,
                label: `${r.name.trim()}-${i + 1}`,
              })),
            },
          })),
        },
      },
      include: { rooms: { include: { beds: true } } },
    });
  }

  /** Admet un patient sur un lit libre (transaction). */
  async admit(tenantId: string, dto: AdmitDto) {
    return this.prisma.$transaction(async (tx) => {
      const bed = await tx.bed.findFirst({
        where: { id: dto.bedId, tenantId },
        include: { room: true },
      });
      if (!bed) throw new NotFoundException('Lit introuvable');
      if (bed.status !== 'AVAILABLE')
        throw new BadRequestException('Ce lit n’est pas disponible');

      const patient = await tx.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!patient) throw new NotFoundException('Patient introuvable');

      const already = await tx.admission.findFirst({
        where: { tenantId, patientId: dto.patientId, status: 'ACTIVE' },
      });
      if (already)
        throw new BadRequestException('Ce patient est déjà hospitalisé');

      await tx.bed.update({
        where: { id: bed.id },
        data: { status: 'OCCUPIED' },
      });

      return tx.admission.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          bedId: bed.id,
          wardId: bed.room.wardId,
          reason: dto.reason?.trim(),
        },
        include: { patient: true, ward: true, bed: { include: { room: true } } },
      });
    });
  }

  /** Transfere un patient actif vers un autre lit libre (transaction). */
  async transfer(tenantId: string, admissionId: string, newBedId: string) {
    return this.prisma.$transaction(async (tx) => {
      const adm = await tx.admission.findFirst({
        where: { id: admissionId, tenantId, status: 'ACTIVE' },
      });
      if (!adm) throw new NotFoundException('Admission active introuvable');

      const newBed = await tx.bed.findFirst({
        where: { id: newBedId, tenantId },
        include: { room: true },
      });
      if (!newBed) throw new NotFoundException('Lit cible introuvable');
      if (newBed.status !== 'AVAILABLE')
        throw new BadRequestException('Le lit cible n’est pas disponible');

      await tx.bed.update({
        where: { id: adm.bedId },
        data: { status: 'AVAILABLE' },
      });
      await tx.bed.update({
        where: { id: newBed.id },
        data: { status: 'OCCUPIED' },
      });
      return tx.admission.update({
        where: { id: adm.id },
        data: { bedId: newBed.id, wardId: newBed.room.wardId },
        include: { patient: true, ward: true, bed: { include: { room: true } } },
      });
    });
  }

  /** Sortie : libere le lit (transaction). */
  async discharge(tenantId: string, admissionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const adm = await tx.admission.findFirst({
        where: { id: admissionId, tenantId, status: 'ACTIVE' },
      });
      if (!adm) throw new NotFoundException('Admission active introuvable');

      await tx.bed.update({
        where: { id: adm.bedId },
        data: { status: 'AVAILABLE' },
      });
      return tx.admission.update({
        where: { id: adm.id },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargedAt: new Date(),
        },
      });
    });
  }

  /** Provisionne une structure de demonstration si aucun service n'existe. */
  async ensureDemo(tenantId: string) {
    const count = await this.prisma.ward.count({ where: { tenantId } });
    if (count > 0) return { created: false };
    const demo: { name: string; rooms: { name: string; beds: number }[] }[] = [
      { name: 'Médecine interne', rooms: [{ name: 'MI-A', beds: 6 }, { name: 'MI-B', beds: 6 }] },
      { name: 'Chirurgie', rooms: [{ name: 'CHIR', beds: 8 }] },
      { name: 'Maternité', rooms: [{ name: 'MAT', beds: 6 }] },
      { name: 'Pédiatrie', rooms: [{ name: 'PED', beds: 8 }] },
    ];
    for (const w of demo) await this.createWard(tenantId, w);
    return { created: true };
  }
}
