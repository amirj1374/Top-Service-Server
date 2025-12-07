import { IsString, IsOptional, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @Matches(/^\d{2}\s[آ-ی]\s\d{3}\s\d{2}$/, {
    message: 'Plate must match the format: "12 م 345 67"',
  })
  plate: string;

  @IsString()
  carModelId: string;
}

export class CreateCustomerDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCarDto)
  @IsOptional()
  cars?: CreateCarDto[];
}

