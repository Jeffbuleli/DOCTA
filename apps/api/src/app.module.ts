import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CurrencyModule } from './currency/currency.module';
import { PatientsModule } from './patients/patients.module';
import { HospitalModule } from './hospital/hospital.module';
import { BillingModule } from './billing/billing.module';
import { StatsModule } from './stats/stats.module';
import { MailModule } from './mail/mail.module';
import { AccountModule } from './account/account.module';
import { PublicModule } from './public/public.module';
import { RecordsModule } from './records/records.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    MailModule,
    AuthModule,
    UsersModule,
    CurrencyModule,
    PatientsModule,
    HospitalModule,
    BillingModule,
    StatsModule,
    AccountModule,
    PublicModule,
    RecordsModule,
    MembershipsModule,
    AppointmentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
