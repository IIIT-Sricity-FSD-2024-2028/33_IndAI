import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { COURSE_STATUSES, DIFFICULTIES } from '../../common/validation.constants';

export class CreateCourseDto {
  @ApiProperty({ example: 'u5' }) @IsString() @IsNotEmpty({ message: 'Provider ID is required.' }) providerId: string;
  @ApiProperty({ example: 'Paper Trading Basics', minLength: 3 }) @IsString() @MinLength(3, { message: 'Course title must be at least 3 characters.' }) title: string;
  @ApiProperty({ example: 'Learn simulated trading.', minLength: 3 }) @IsString() @MinLength(3, { message: 'Description must be at least 3 characters.' }) description: string;
  @ApiProperty({ example: 10, minimum: 1, maximum: 200 }) @Type(() => Number) @IsInt() @Min(1) @Max(200) lessons: number;
  @ApiPropertyOptional({ example: '4 weeks' }) @IsOptional() @IsString() duration?: string;
  @ApiProperty({ example: 100, minimum: 1, maximum: 200 }) @Type(() => Number) @IsInt() @Min(1) @Max(200) skillPoints: number;
  @ApiProperty({ example: 'Trading' }) @IsString() @IsNotEmpty({ message: 'Category is required.' }) category: string;
  @ApiPropertyOptional({ enum: DIFFICULTIES, example: 'BEGINNER' }) @IsOptional() @IsIn(DIFFICULTIES as any, { message: 'Invalid difficulty.' }) difficulty?: string;
  @ApiPropertyOptional({ enum: COURSE_STATUSES, example: 'draft' }) @IsOptional() @IsIn(COURSE_STATUSES as any, { message: 'Invalid status.' }) status?: string;
  @ApiPropertyOptional({ enum:['FREE','PRO'], example:'FREE' }) @IsOptional() @IsIn(['FREE','PRO']) accessTier?:string;
  @ApiPropertyOptional({ example:10000, minimum:0, description:'Provider quoted amount for course production/licensing.' }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) quotedPrice?:number;
  @ApiPropertyOptional({ enum:['PLATFORM','ORGANIZATION'], example:'PLATFORM' }) @IsOptional() @IsIn(['PLATFORM','ORGANIZATION']) scope?:string;
  @ApiPropertyOptional({ example:'org1' }) @IsOptional() @IsString() organizationId?:string;
}
export class UpdateCourseDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) title?: string;
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) description?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 200 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) lessons?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 200 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(200) skillPoints?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ enum: DIFFICULTIES }) @IsOptional() @IsIn(DIFFICULTIES as any) difficulty?: string;
  @ApiPropertyOptional({ enum: COURSE_STATUSES }) @IsOptional() @IsIn(COURSE_STATUSES as any) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() providerId?: string;
  @ApiPropertyOptional({ enum:['FREE','PRO'] }) @IsOptional() @IsIn(['FREE','PRO']) accessTier?:string;
  @ApiPropertyOptional({ minimum:0 }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) quotedPrice?:number;
  @ApiPropertyOptional({ enum:['PLATFORM','ORGANIZATION'] }) @IsOptional() @IsIn(['PLATFORM','ORGANIZATION']) scope?:string;
  @ApiPropertyOptional() @IsOptional() @IsString() organizationId?:string;
}
