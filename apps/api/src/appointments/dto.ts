import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsOptional()
  @IsString()
  doctorAccountId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsDateString()
  scheduledAt!: string;
}

export class UpdateStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;
}
