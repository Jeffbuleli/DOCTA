import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.HR)
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.users.findAllForTenant(user.tenantId);
  }
}
