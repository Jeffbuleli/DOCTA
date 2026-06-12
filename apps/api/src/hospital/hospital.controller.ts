import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { HospitalService } from './hospital.service';
import { AdmitDto, CreateWardDto, TransferDto } from './dto';

@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospital: HospitalService) {}

  @Get('wards')
  wards(@CurrentUser() u: AuthUser) {
    return this.hospital.listWards(u.tenantId);
  }

  @Get('beds')
  beds(@CurrentUser() u: AuthUser, @Query('wardId') wardId?: string) {
    return this.hospital.availableBeds(u.tenantId, wardId);
  }

  @Get('admissions')
  admissions(@CurrentUser() u: AuthUser) {
    return this.hospital.listActiveAdmissions(u.tenantId);
  }

  @Roles(Role.ADMIN)
  @Post('wards')
  createWard(@CurrentUser() u: AuthUser, @Body() dto: CreateWardDto) {
    return this.hospital.createWard(u.tenantId, dto);
  }

  @Roles(Role.ADMIN)
  @Post('setup-demo')
  setupDemo(@CurrentUser() u: AuthUser) {
    return this.hospital.ensureDemo(u.tenantId);
  }

  @Roles(Role.ADMIN, Role.RECEPTION, Role.DOCTOR, Role.NURSE)
  @Post('admissions')
  admit(@CurrentUser() u: AuthUser, @Body() dto: AdmitDto) {
    return this.hospital.admit(u.tenantId, dto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @Patch('admissions/:id/transfer')
  transfer(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: TransferDto,
  ) {
    return this.hospital.transfer(u.tenantId, id, dto.bedId);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @Patch('admissions/:id/discharge')
  discharge(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.hospital.discharge(u.tenantId, id);
  }
}
