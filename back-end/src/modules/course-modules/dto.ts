import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { MODULE_TYPES } from '../../common/validation.constants';
export class CreateCourseModuleDto {
  @ApiProperty({ example: 'Market Basics', minLength: 3 }) @IsString() @MinLength(3, { message: 'Module title must be at least 3 characters.' }) title: string;
  @ApiPropertyOptional({ enum: MODULE_TYPES, example: 'video' }) @IsOptional() @IsIn(MODULE_TYPES as any, { message: 'Invalid module type.' }) type?: string;
  @ApiPropertyOptional({ example: '15 min' }) @IsOptional() @IsString() duration?: string;
  @ApiProperty({ example: 1, minimum: 1 }) @Type(() => Number) @IsInt() @Min(1, { message: 'Module order must be a positive integer.' }) order: number;
  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' }) @IsOptional() @IsUrl({ require_protocol: true, protocols: ['http','https'] }, { message: 'Material URL must start with http:// or https://.' }) url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
export class UpdateCourseModuleDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) title?: string;
  @ApiPropertyOptional({ enum: MODULE_TYPES }) @IsOptional() @IsIn(MODULE_TYPES as any) type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) order?: number;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_protocol: true, protocols: ['http','https'] }) url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
