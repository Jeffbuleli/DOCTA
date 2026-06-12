import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHospitalDto, InviteDto, UpdateProfileDto } from './dto';

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'hopital'
  );
}

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Rattache les invitations en attente (par e-mail) a un compte. */
  async claimInvites(accountId: string, email: string) {
    await this.prisma.membership.updateMany({
      where: { invitedEmail: email.toLowerCase(), accountId: null },
      data: { accountId },
    });
  }

  /** Mes appartenances (actives, en attente, terminees) avec l'hopital. */
  listForAccount(accountId: string) {
    return this.prisma.membership.findMany({
      where: { accountId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { tenant: { select: { id: true, name: true, slug: true, city: true } } },
    });
  }

  /** Cree un hopital ; le createur en devient ADMIN actif. */
  async createHospital(accountId: string, dto: CreateHospitalDto) {
    let slug = slugify(dto.name);
    if (await this.prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name.trim(),
        slug,
        city: dto.city,
        address: dto.address,
        phone: dto.phone,
        latitude: dto.latitude,
        longitude: dto.longitude,
        memberships: {
          create: {
            accountId,
            role: Role.ADMIN,
            title: 'Fondateur',
            status: 'ACTIVE',
            startDate: new Date(),
          },
        },
      },
    });
    return tenant;
  }

  private async requireAdmin(accountId: string, tenantId: string) {
    const m = await this.prisma.membership.findFirst({
      where: { accountId, tenantId, role: Role.ADMIN, status: 'ACTIVE' },
    });
    if (!m) throw new ForbiddenException("Vous n'etes pas administrateur de cet hopital");
    return m;
  }

  /** [ADMIN] Invite une personne (par e-mail) a rejoindre l'hopital. */
  async invite(actorId: string, tenantId: string, dto: InviteDto) {
    await this.requireAdmin(actorId, tenantId);
    const email = dto.email.toLowerCase().trim();

    const account = await this.prisma.account.findUnique({ where: { email } });

    // Pas de doublon actif/en attente pour la meme personne/email dans cet hopital.
    const existing = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        status: { in: ['PENDING', 'ACTIVE'] },
        OR: [
          account ? { accountId: account.id } : undefined,
          { invitedEmail: email },
        ].filter(Boolean) as object[],
      },
    });
    if (existing) throw new BadRequestException('Cette personne est deja invitee ou membre');

    return this.prisma.membership.create({
      data: {
        tenantId,
        accountId: account?.id ?? null,
        invitedEmail: email,
        role: dto.role,
        title: dto.title?.trim(),
        status: 'PENDING',
      },
    });
  }

  /** [PERSONNE] Accepte une invitation. */
  async accept(accountId: string, membershipId: string) {
    const m = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!m || m.accountId !== accountId) throw new NotFoundException('Invitation introuvable');
    if (m.status !== 'PENDING') throw new BadRequestException('Invitation deja traitee');
    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: 'ACTIVE', startDate: new Date() },
    });
  }

  /** [PERSONNE] Refuse une invitation. */
  async decline(accountId: string, membershipId: string) {
    const m = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!m || m.accountId !== accountId) throw new NotFoundException('Invitation introuvable');
    if (m.status !== 'PENDING') throw new BadRequestException('Invitation deja traitee');
    await this.prisma.membership.delete({ where: { id: membershipId } });
    return { declined: true };
  }

  /** [ADMIN] Met fin a une appartenance (licenciement / fin de contrat). */
  async endMembership(actorId: string, membershipId: string) {
    const m = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!m) throw new NotFoundException('Appartenance introuvable');
    await this.requireAdmin(actorId, m.tenantId);
    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: 'ENDED', endDate: new Date() },
    });
  }

  /** [ADMIN] Liste le personnel de l'hopital. */
  async listMembers(actorId: string, tenantId: string) {
    await this.requireAdmin(actorId, tenantId);
    return this.prisma.membership.findMany({
      where: { tenantId },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      include: {
        account: { select: { id: true, fullName: true, email: true, headline: true } },
      },
    });
  }

  updateProfile(accountId: string, dto: UpdateProfileDto) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: { headline: dto.headline, bio: dto.bio },
      select: { id: true, fullName: true, headline: true, bio: true },
    });
  }

  /** Profil public (type LinkedIn) : identite + parcours (hors invitations en attente). */
  async publicProfile(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, fullName: true, headline: true, bio: true },
    });
    if (!account) throw new NotFoundException('Profil introuvable');

    const experience = await this.prisma.membership.findMany({
      where: { accountId, status: { in: ['ACTIVE', 'ENDED'] } },
      orderBy: [{ startDate: 'desc' }],
      include: { tenant: { select: { name: true, city: true } } },
    });

    return {
      account,
      experience: experience.map((e) => ({
        hospital: e.tenant.name,
        city: e.tenant.city,
        role: e.role,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
      })),
    };
  }
}
