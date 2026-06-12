import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Currency, PayMethod } from '@prisma/client';

class ItemDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsEnum(Currency)
  currency!: Currency;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];
}

export class CreatePaymentDto {
  @IsEnum(PayMethod)
  method!: PayMethod;

  @IsEnum(Currency)
  currency!: Currency;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  reference?: string;
}
