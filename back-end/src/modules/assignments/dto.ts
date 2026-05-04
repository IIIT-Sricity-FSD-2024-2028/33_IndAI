import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { ASSIGNMENT_STATUSES, DIFFICULTIES } from '../../common/validation.constants';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Trading Plan', minLength: 3 }) @IsString() @MinLength(3) title: string;
  @ApiProperty({ example: 'Submit a paper trade plan.', minLength: 3 }) @IsString() @MinLength(3) description: string;
  @ApiProperty({ example: 'u3' }) @IsString() @IsNotEmpty({ message: 'Instructor ID is required.' }) instructorId: string;
  @ApiPropertyOptional({ type: [String], example: ['u6'] }) @IsOptional() @IsArray() @IsString({ each: true }) studentIds?: string[];
  @ApiProperty({ example: '2026-05-20', description: 'Must be a future date within 365 days.' }) @IsString() @IsNotEmpty({ message: 'Due date is required.' }) dueDate: string;
  @ApiProperty({ example: 50, minimum: 1, maximum: 200 }) @Type(() => Number) @IsInt() @Min(1) @Max(200) skillPoints: number;
  @ApiPropertyOptional({ enum: DIFFICULTIES, example: 'Medium' }) @IsOptional() @IsIn(DIFFICULTIES as any, { message: 'Invalid difficulty.' }) difficulty?: string;
  @ApiPropertyOptional({ enum: ASSIGNMENT_STATUSES, example: 'active' }) @IsOptional() @IsIn(ASSIGNMENT_STATUSES as any, { message: 'Invalid assignment status.' }) status?: string;
  @ApiPropertyOptional({ example: 'Trading Challenge' }) @IsOptional() @IsString() type?: string;
}
export class UpdateAssignmentDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) title?: string;
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructorId?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) studentIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() dueDate?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 200 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) skillPoints?: number;
  @ApiPropertyOptional({ enum: DIFFICULTIES }) @IsOptional() @IsIn(DIFFICULTIES as any) difficulty?: string;
  @ApiPropertyOptional({ enum: ASSIGNMENT_STATUSES }) @IsOptional() @IsIn(ASSIGNMENT_STATUSES as any) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
}
export class SubmitAssignmentDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'learnerId is required.' }) learnerId: string;
  @ApiPropertyOptional({ example: 'My solution text' }) @IsOptional() @IsString() submissionText?: string;
}
