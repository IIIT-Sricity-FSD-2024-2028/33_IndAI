import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
export class CreateQuizDto {
  @ApiPropertyOptional({ example: 'c1' }) @IsOptional() @IsString() courseId?: string;
  @ApiPropertyOptional({ example: 'u5' }) @IsOptional() @IsString() providerId?: string;
  @ApiProperty({ example: 'Basics Quiz', minLength: 3 }) @IsString() @MinLength(3, { message: 'Quiz title must be at least 3 characters.' }) title: string;
  @ApiPropertyOptional({ description: 'Frontend may send a question count number; API may also accept question objects.', example: [{ q:'Paper trading?', options:['Virtual','Real'], ans:0 }] }) @IsOptional() questions?: any;
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) questionCount?: number;
  @ApiPropertyOptional({ enum: ['active','inactive'] }) @IsOptional() @IsString() status?: string;
}
export class UpdateQuizDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() courseId?: string;
  @ApiPropertyOptional() @IsOptional() questions?: any;
  @ApiPropertyOptional({ minimum: 1, maximum: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) questionCount?: number;
  @ApiPropertyOptional({ minimum: 5, maximum: 120 }) @IsOptional() @Type(() => Number) @IsInt() @Min(5) @Max(120) timeLimit?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) passingScore?: number;
  @ApiPropertyOptional({ minimum: 0, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) skillPointsOnPass?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiPropertyOptional({ enum: ['active','inactive'] }) @IsOptional() @IsString() status?: string;
}
export class SubmitQuizDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId: string;
  @ApiProperty({ type: [Number], example: [0,1,2] }) @IsArray() @IsInt({ each: true }) answers: number[];
}
