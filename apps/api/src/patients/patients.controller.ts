import {
  Body,
  Controller,
  Get,
  Param,
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
import { PatientsService } from './patients.service';
import { CreatePatientDto, ListPatientsQuery } from './dto';

@UseGuards(AccountJwtGuard, MembershipGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  // Tout utilisateur connecte du tenant peut consulter.
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() q: ListPatientsQuery) {
    return this.patients.list(user.tenantId, q.search, q.take);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.patients.get(user.tenantId, id);
  }

  // Creation reservee a l'accueil et au personnel clinique.
  @Roles(Role.ADMIN, Role.RECEPTION, Role.DOCTOR, Role.NURSE)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePatientDto) {
    return this.patients.create(user.tenantId, dto);
  }
}
