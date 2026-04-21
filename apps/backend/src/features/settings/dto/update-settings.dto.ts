import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(['claude', 'openai', 'gemini'])
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
