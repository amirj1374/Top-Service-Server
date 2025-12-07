import { IsString, IsUUID, Matches, IsOptional } from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @Matches(/^\d{2}\s[آ-ی]\s\d{3}\s\d{2}$/, {
    message: 'Plate must match the format: "12 م 345 67"',
  })
  plate: string;

  @IsUUID()
  carModelId: string;
}

