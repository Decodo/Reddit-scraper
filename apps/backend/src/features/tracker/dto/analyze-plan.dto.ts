import {
  IsString,
  MinLength,
  IsArray,
  IsIn,
  ArrayMinSize,
  IsOptional,
  IsInt,
  Min,
  Max,
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

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  maxPosts?: number;
}
