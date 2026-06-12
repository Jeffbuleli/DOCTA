import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RecordsService } from './records.service';
import {
  AccountRecordsController,
  StaffRecordsController,
} from './records.controller';
import { AccountJwtStrategy } from '../account/account-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-a-changer',
    }),
  ],
  controllers: [AccountRecordsController, StaffRecordsController],
  providers: [RecordsService, AccountJwtStrategy],
})
export class RecordsModule {}
