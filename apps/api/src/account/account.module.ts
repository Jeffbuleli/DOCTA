import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountJwtStrategy } from './account-jwt.strategy';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    PassportModule,
    MembershipsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-a-changer',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountJwtStrategy],
})
export class AccountModule {}
