import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Cree un etablissement + son premier compte ADMIN. */
  async register(dto: RegisterDto) {
    const slug = slugify(dto.tenantName);

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Un etablissement avec ce nom existe deja');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.tenantName,
        slug,
        city: dto.city,
        users: {
          create: {
            email: dto.email.toLowerCase(),
            passwordHash,
            fullName: dto.fullName,
            role: Role.ADMIN,
          },
        },
      },
      include: { users: true },
    });

    const user = tenant.users[0];
    return this.sign(user.id, tenant.id, user.role, user.email, {
      tenantSlug: tenant.slug,
      fullName: user.fullName,
    });
  }

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });
    if (!tenant) throw new UnauthorizedException('Identifiants invalides');

    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email.toLowerCase(),
        },
      },
    });
    if (!user || !user.active) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');

    return this.sign(user.id, tenant.id, user.role, user.email, {
      tenantSlug: tenant.slug,
      fullName: user.fullName,
    });
  }

  private sign(
    userId: string,
    tenantId: string,
    role: Role,
    email: string,
    extra: Record<string, unknown>,
  ) {
    const token = this.jwt.sign({
      sub: userId,
      tenantId,
      role,
      email,
    });
    return {
      accessToken: token,
      user: { id: userId, email, role, ...extra },
    };
  }
}
