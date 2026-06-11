import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste les patients du tenant, filtre optionnel sur nom / MRN / telephone. */
  list(tenantId: string, search?: string, take = 50) {
    const where: Prisma.PatientWhereInput = { tenantId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { mrn: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 200),
    });
  }

  async get(tenantId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable');
    return patient;
  }

  /** Cree un patient avec un MRN sequentiel par etablissement (P00001...). */
  async create(tenantId: string, dto: CreatePatientDto) {
    // Petite boucle de securite en cas de collision de MRN concurrente.
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.prisma.patient.count({ where: { tenantId } });
      const mrn = `P${String(count + 1 + attempt).padStart(5, '0')}`;
      try {
        return await this.prisma.patient.create({
          data: {
            tenantId,
            mrn,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            sex: dto.sex,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            phone: dto.phone?.trim(),
            address: dto.address?.trim(),
          },
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          continue; // MRN deja pris -> on retente
        }
        throw e;
      }
    }
    throw new Error("Impossible de generer un MRN unique");
  }
}
