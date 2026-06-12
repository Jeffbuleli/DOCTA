import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { CurrentAccount, AuthAccount } from '../account/current-account.decorator';
import { RecordsService } from './records.service';
import { LinkCodeDto, LinkDto, RedeemDto } from './dto';

/** Cote PATIENT (compte global). */
@UseGuards(AccountJwtGuard)
@Controller('account/records')
export class AccountRecordsController {
  constructor(private readonly records: RecordsService) {}

  @Get()
  list(@CurrentAccount() a: AuthAccount) {
    return this.records.listRecords(a.accountId);
  }

  @Post('link')
  link(@CurrentAccount() a: AuthAccount, @Body() dto: LinkDto) {
    return this.records.linkByCode(a.accountId, dto.code);
  }

  @Post('share')
  share(@CurrentAccount() a: AuthAccount) {
    return this.records.createShare(a.accountId);
  }
}

/** Cote HOPITAL (personnel). */
@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('records')
export class StaffRecordsController {
  constructor(private readonly records: RecordsService) {}

  @Roles(Role.ADMIN, Role.RECEPTION, Role.DOCTOR, Role.NURSE)
  @Post('link-code')
  linkCode(@CurrentUser() u: AuthUser, @Body() dto: LinkCodeDto) {
    return this.records.generateLinkCode(u.tenantId, dto.patientId);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTION)
  @Post('redeem')
  redeem(@CurrentUser() u: AuthUser, @Body() dto: RedeemDto) {
    return this.records.redeemShare(dto.code, u.tenantId, u.userId);
  }
}
