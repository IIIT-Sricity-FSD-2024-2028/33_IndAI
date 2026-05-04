import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
export class CreateFeedbackDto {
  @ApiProperty({ example: 'u3' }) @IsString() @IsNotEmpty({ message: 'Instructor ID is required.' }) instructorId: string;
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId: string;
  @ApiProperty({ example: 'Good progress', minLength: 3 }) @IsString() @MinLength(3, { message: 'Message must be at least 3 characters.' }) message: string;
  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) rating?: number;
}
export class UpdateFeedbackDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) message?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 5 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) rating?: number;
}
