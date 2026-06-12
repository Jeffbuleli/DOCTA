import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceStatus, Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, CreatePaymentDto } from './dto';

@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('invoices')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  list(
    @CurrentUser() u: AuthUser,
    @Query('status') status?: InvoiceStatus,
    @Query('search') search?: string,
  ) {
    return this.billing.list(u.tenantId, status, search);
  }

  @Get(':id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.billing.get(u.tenantId, id);
  }

  @Roles(Role.ADMIN, Role.CASHIER, Role.RECEPTION)
  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateInvoiceDto) {
    return this.billing.create(u.tenantId, dto);
  }

  @Roles(Role.ADMIN, Role.CASHIER)
  @Post(':id/payments')
  pay(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.billing.addPayment(u.tenantId, id, dto);
  }
}
