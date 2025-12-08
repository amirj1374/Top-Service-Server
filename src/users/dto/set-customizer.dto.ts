import { IsOptional, IsString } from 'class-validator';

export class SetCustomizerDto {
  @IsString()
  @IsOptional()
  customizer?: string | null;
}

