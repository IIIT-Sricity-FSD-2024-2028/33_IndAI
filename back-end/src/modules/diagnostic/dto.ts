import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
export class SubmitDiagnosticDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId: string;
  @ApiProperty({ example: 72, minimum: 0, maximum: 100, description: '0-40 Beginner, 41-75 Intermediate, 76-100 Advanced.' }) @Type(() => Number) @IsInt() @Min(0) @Max(100) score: number;
}
