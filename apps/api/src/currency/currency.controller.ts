import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsNumber, IsPositive } from 'class-validator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { CurrencyService } from './currency.service';

class SetRateDto {
  @IsNumber()
  @IsPositive()
  cdfPerUsd!: number;
}

class ConvertDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsIn(['USD', 'CDF'])
  from!: 'USD' | 'CDF';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currency: CurrencyService) {}

  @Get('rate')
  latest(@CurrentUser() user: AuthUser) {
    return this.currency.latest(user.tenantId);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.CASHIER)
  @Post('rate')
  setRate(@CurrentUser() user: AuthUser, @Body() dto: SetRateDto) {
    return this.currency.setRate(user.tenantId, dto.cdfPerUsd);
  }

  @Get('convert')
  convert(@CurrentUser() user: AuthUser, @Query() dto: ConvertDto) {
    return this.currency.convert(user.tenantId, Number(dto.amount), dto.from);
  }
}
