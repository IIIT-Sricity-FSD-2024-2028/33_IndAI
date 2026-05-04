import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId: string;
  @ApiProperty({ example: 'c1' }) @IsString() @IsNotEmpty({ message: 'Course ID is required.' }) courseId: string;
  @ApiPropertyOptional({ example: 'Admin User' }) @IsOptional() @IsString() assignedBy?: string;
}
export class UpdateProgressDto {
  @ApiProperty({ example: 75, minimum: 0, maximum: 100 }) @Type(() => Number) @IsInt() @Min(0) @Max(100) progress: number;
  @ApiPropertyOptional({ enum: ['in_progress','completed','pending'] }) @IsOptional() @IsIn(['in_progress','completed','pending'] as any, { message: 'Invalid enrollment status.' }) status?: string;
}
