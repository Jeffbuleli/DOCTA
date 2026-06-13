import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import {
  AccountAppointmentsController,
  StaffAppointmentsController,
  PublicDoctorsController,
} from './appointments.controller';
import { AccountJwtStrategy } from '../account/account-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-a-changer',
    }),
  ],
  controllers: [
    AccountAppointmentsController,
    StaffAppointmentsController,
    PublicDoctorsController,
  ],
  providers: [AppointmentsService, AccountJwtStrategy],
})
export class AppointmentsModule {}
