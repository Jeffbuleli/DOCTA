import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { MembershipGuard } from '../common/membership.guard';
import { CurrentAccount, AuthAccount } from '../account/current-account.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateStatusDto } from './dto';

/** Cote PATIENT. */
@UseGuards(AccountJwtGuard)
@Controller('me/appointments')
export class AccountAppointmentsController {
  constructor(private readonly appts: AppointmentsService) {}

  @Get()
  mine(@CurrentAccount() a: AuthAccount) {
    return this.appts.listForPatient(a.accountId);
  }

  @Post()
  book(@CurrentAccount() a: AuthAccount, @Body() dto: CreateAppointmentDto) {
    return this.appts.book(a.accountId, dto);
  }

  @Patch(':id/cancel')
  cancel(@CurrentAccount() a: AuthAccount, @Param('id') id: string) {
    return this.appts.cancelByPatient(a.accountId, id);
  }
}

/** Cote HOPITAL (personnel). */
@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('appointments')
export class StaffAppointmentsController {
  constructor(private readonly appts: AppointmentsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.appts.listForTenant(u.tenantId);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTION)
  @Patch(':id/status')
  setStatus(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appts.setStatus(u.tenantId, id, dto.status);
  }
}

/** Liste publique des medecins d'un hopital (pour reserver). */
@Controller('public/hospitals')
export class PublicDoctorsController {
  constructor(private readonly appts: AppointmentsService) {}

  @Get(':tenantId/doctors')
  doctors(@Param('tenantId') tenantId: string) {
    return this.appts.doctorsOfHospital(tenantId);
  }
}
