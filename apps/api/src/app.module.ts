import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    CurrencyModule,
    PatientsModule,
    HospitalModule,
    BillingModule,
    StatsModule,
    AccountModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
