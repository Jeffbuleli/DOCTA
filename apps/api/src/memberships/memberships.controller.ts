import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccountJwtGuard } from '../account/account-jwt.guard';
import { CurrentAccount, AuthAccount } from '../account/current-account.decorator';
import { MembershipsService } from './memberships.service';
import { CreateHospitalDto, InviteDto, UpdateProfileDto } from './dto';

/** Cote PERSONNE (compte unique). */
@UseGuards(AccountJwtGuard)
@Controller('me')
export class MembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get('memberships')
  mine(@CurrentAccount() a: AuthAccount) {
    return this.memberships.listForAccount(a.accountId);
  }

  @Post('hospitals')
  createHospital(@CurrentAccount() a: AuthAccount, @Body() dto: CreateHospitalDto) {
    return this.memberships.createHospital(a.accountId, dto);
  }

  @Post('memberships/:id/accept')
  accept(@CurrentAccount() a: AuthAccount, @Param('id') id: string) {
    return this.memberships.accept(a.accountId, id);
  }

  @Post('memberships/:id/decline')
  decline(@CurrentAccount() a: AuthAccount, @Param('id') id: string) {
    return this.memberships.decline(a.accountId, id);
  }

  @Post('memberships/:id/end')
  end(@CurrentAccount() a: AuthAccount, @Param('id') id: string) {
    return this.memberships.endMembership(a.accountId, id);
  }

  @Post('hospitals/:tenantId/invite')
  invite(
    @CurrentAccount() a: AuthAccount,
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteDto,
  ) {
    return this.memberships.invite(a.accountId, tenantId, dto);
  }

  @Get('hospitals/:tenantId/members')
  members(@CurrentAccount() a: AuthAccount, @Param('tenantId') tenantId: string) {
    return this.memberships.listMembers(a.accountId, tenantId);
  }

  @Patch('profile')
  updateProfile(@CurrentAccount() a: AuthAccount, @Body() dto: UpdateProfileDto) {
    return this.memberships.updateProfile(a.accountId, dto);
  }
}

/** Profil public (type LinkedIn) — sans authentification. */
@Controller('public')
export class PublicProfileController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get('profile/:accountId')
  profile(@Param('accountId') accountId: string) {
    return this.memberships.publicProfile(accountId);
  }
}
