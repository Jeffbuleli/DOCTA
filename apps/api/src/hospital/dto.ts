import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class RoomSpec {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(60)
  beds!: number;
}

export class CreateWardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomSpec)
  rooms?: RoomSpec[];
}

export class AdmitDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  bedId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  bedId!: string;
}
