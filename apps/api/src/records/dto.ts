import { IsNotEmpty, IsString } from 'class-validator';

export class LinkCodeDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;
}

export class RedeemDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class LinkDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
