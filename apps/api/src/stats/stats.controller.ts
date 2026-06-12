import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { StatsService } from './stats.service';

@UseGuards(AccountJwtGuard, MembershipGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.stats.dashboard(user.tenantId);
  }
}
