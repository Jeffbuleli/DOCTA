import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Garde "personnel" de l'ere identite-unique.
 * A utiliser APRES AccountJwtGuard (qui pose req.user = { accountId, email }).
 * Lit l'hopital actif dans l'en-tete `X-Tenant`, verifie une appartenance ACTIVE,
 * puis remplace req.user par { userId, tenantId, role, email } — meme forme que
 * l'ancien AuthUser, pour que les controleurs et RolesGuard existants marchent.
 */
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const account = req.user as { accountId?: string; email?: string } | undefined;
    const tenantId = (req.headers['x-tenant'] || req.headers['X-Tenant']) as
      | string
      | undefined;

    if (!account?.accountId || !tenantId) {
      throw new ForbiddenException('Hopital actif non specifie');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { accountId: account.accountId, tenantId, status: 'ACTIVE' },
    });
    if (!membership) {
      throw new ForbiddenException("Vous n'etes pas membre actif de cet hopital");
    }

    req.user = {
      userId: account.accountId,
      tenantId,
      role: membership.role,
      email: account.email,
    };
    return true;
  }
}
