import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, Matches } from 'class-validator';
import { SESSION_STATUSES } from '../../common/validation.constants';

export class CreateSessionDto {
  @ApiProperty({ example: 'u3' }) @IsString() @IsNotEmpty({ message: 'Instructor ID is required.' }) instructorId: string;
  @ApiProperty({ example: 'Live Trading Practice', minLength: 3 }) @IsString() @MinLength(3, { message: 'Session title must be at least 3 characters.' }) title: string;
  @ApiPropertyOptional({ example: 'Practice session', minLength: 3 }) @IsOptional() @IsString() @MinLength(3) description?: string;
  @ApiProperty({ example: '2026-05-10', description: 'Must be a future date within 365 days.' }) @IsString() @IsNotEmpty({ message: 'Session date is required.' }) date: string;
  @ApiProperty({ example: '10:00' }) @IsString() @IsNotEmpty({ message: 'Time is required.' }) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be in HH:mm format.' }) time: string;
  @ApiPropertyOptional({ type: [String], example: ['u6'] }) @IsOptional() @IsArray() @IsString({ each: true }) studentIds?: string[];
  @ApiPropertyOptional({ example: 60, minimum: 15, maximum: 480 }) @IsOptional() @Type(() => Number) @IsInt() @Min(15) @Max(480) duration?: number;
  @ApiPropertyOptional({ enum: SESSION_STATUSES, example: 'scheduled' }) @IsOptional() @IsIn(SESSION_STATUSES as any, { message: 'Invalid session status.' }) status?: string;
  @ApiPropertyOptional({ example: 'Trading Session' }) @IsOptional() @IsString() type?: string;
}
export class UpdateSessionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() instructorId?: string;
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) title?: string;
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be in HH:mm format.' }) time?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) studentIds?: string[];
  @ApiPropertyOptional({ minimum: 15, maximum: 480 }) @IsOptional() @Type(() => Number) @IsInt() @Min(15) @Max(480) duration?: number;
  @ApiPropertyOptional({ enum: SESSION_STATUSES }) @IsOptional() @IsIn(SESSION_STATUSES as any) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
}
