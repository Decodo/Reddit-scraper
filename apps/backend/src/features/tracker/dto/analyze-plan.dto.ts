import {
  IsString,
  MinLength,
  IsArray,
  IsIn,
  ArrayMinSize,
} from 'class-validator';

export class AnalyzePlanDto {
  @IsString()
  @MinLength(3)
  prompt: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  subreddits: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  queries: string[];

  @IsIn(['day', 'week', 'month', 'year'])
  timeRange: 'day' | 'week' | 'month' | 'year';
}
