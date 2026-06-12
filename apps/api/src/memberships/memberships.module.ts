import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MembershipsService } from './memberships.service';
import {
  MembershipsController,
  PublicProfileController,
} from './memberships.controller';
import { AccountJwtStrategy } from '../account/account-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-a-changer',
    }),
  ],
  controllers: [MembershipsController, PublicProfileController],
  providers: [MembershipsService, AccountJwtStrategy],
  exports: [MembershipsService],
})
export class MembershipsModule {}
