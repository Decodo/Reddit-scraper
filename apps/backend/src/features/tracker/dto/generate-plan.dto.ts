import { IsString, MinLength, IsOptional, IsArray, IsIn } from 'class-validator';

export class GeneratePlanDto {
  @IsString()
  @MinLength(3)
  prompt: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subreddits?: string[];

  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year'])
  timeRange?: 'day' | 'week' | 'month' | 'year';
}
