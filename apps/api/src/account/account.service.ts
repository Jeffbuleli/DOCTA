import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AccountLoginDto, AccountRegisterDto } from './dto';

function publicAccount(a: Account) {
  return {
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    phone: a.phone,
    emailVerified: a.emailVerified,
    createdAt: a.createdAt,
  };
}

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  private appUrl(): string {
    return (
      process.env.APP_PUBLIC_URL ||
      process.env.WEB_ORIGIN?.split(',')[0] ||
      'http://localhost:5173'
    );
  }

  private accessToken(a: Account): string {
    return this.jwt.sign({ sub: a.id, email: a.email, typ: 'account' });
  }

  private async sendVerification(a: Account) {
    const token = this.jwt.sign(
      { sub: a.id, purpose: 'verify' },
      { expiresIn: '1d' },
    );
    const link = `${this.appUrl()}/verifier-email?token=${token}`;
    await this.mail.sendVerification(a.email, a.fullName, link);
    return this.mail.isConfigured ? undefined : link; // devLink si pas de Resend
  }

  async register(dto: AccountRegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.account.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Un compte existe deja avec cet e-mail');

    const account = await this.prisma.account.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
      },
    });

    const devLink = await this.sendVerification(account);
    return {
      accessToken: this.accessToken(account),
      account: publicAccount(account),
      devLink,
    };
  }

  async login(dto: AccountLoginDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!account) throw new UnauthorizedException('Identifiants invalides');
    const ok = await bcrypt.compare(dto.password, account.passwordHash);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');

    return {
      accessToken: this.accessToken(account),
      account: publicAccount(account),
    };
  }

  async me(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException();
    return publicAccount(account);
  }

  async verifyEmail(token: string) {
    const payload = this.decode(token, 'verify');
    await this.prisma.account.update({
      where: { id: payload.sub },
      data: { emailVerified: true },
    });
    return { verified: true };
  }

  async resendVerification(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException();
    if (account.emailVerified) return { sent: false, alreadyVerified: true };
    const devLink = await this.sendVerification(account);
    return { sent: true, devLink };
  }

  /** Demande de reinitialisation. Reponse generique (ne revele pas l'existence du compte). */
  async requestReset(email: string) {
    const account = await this.prisma.account.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!account) return { sent: true };

    const token = this.jwt.sign(
      { sub: account.id, purpose: 'reset', ph: account.passwordHash.slice(0, 12) },
      { expiresIn: '1h' },
    );
    const link = `${this.appUrl()}/reinitialiser?token=${token}`;
    await this.mail.sendPasswordReset(account.email, account.fullName, link);
    return { sent: true, devLink: this.mail.isConfigured ? undefined : link };
  }

  async resetPassword(token: string, password: string) {
    const payload = this.decode(token, 'reset');
    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
    });
    if (!account || account.passwordHash.slice(0, 12) !== payload.ph) {
      throw new BadRequestException('Lien invalide ou deja utilise');
    }
    await this.prisma.account.update({
      where: { id: account.id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });
    return { reset: true };
  }

  private decode(token: string, purpose: 'verify' | 'reset'): any {
    try {
      const p = this.jwt.verify(token);
      if (p.purpose !== purpose) throw new Error('purpose');
      return p;
    } catch {
      throw new BadRequestException('Lien invalide ou expire');
    }
  }
}
