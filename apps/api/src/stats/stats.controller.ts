import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { StatsService } from './stats.service';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.stats.dashboard(user.tenantId);
  }
}
