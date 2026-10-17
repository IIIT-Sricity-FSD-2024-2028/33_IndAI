import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
export class UpdateConfigDto {
  @ApiPropertyOptional({ example: 10, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxDailyTrades?: number;
  @ApiPropertyOptional({ example: 150000, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) defaultTradingLimit?: number;
  @ApiPropertyOptional({ example: false }) @IsOptional() @IsBoolean() maintenanceMode?: boolean;
  @ApiPropertyOptional({ example: 'IndAI', minLength: 2 }) @IsOptional() @IsString() @MinLength(2) platformName?: string;
  @ApiPropertyOptional({ example: 100000, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxLimit?: number;
  @ApiPropertyOptional({ example: 200, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxPts?: number;
  @ApiPropertyOptional({ example: 10, minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) minMargin?: number;
  @ApiPropertyOptional({ example: 60, minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) cooldown?: number;
}
export class AssignInstructorDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'learnerId is required.' }) learnerId: string;
  @ApiProperty({ example: 'u3' }) @IsString() @IsNotEmpty({ message: 'instructorId is required.' }) instructorId: string;
}
