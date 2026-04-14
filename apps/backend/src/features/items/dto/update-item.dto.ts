import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
