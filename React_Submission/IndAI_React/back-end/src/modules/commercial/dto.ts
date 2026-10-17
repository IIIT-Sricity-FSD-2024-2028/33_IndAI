import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example:'IIIT Sri City' }) @IsString() @MinLength(3) name:string;
  @ApiProperty({ example:'IIITS' }) @IsString() @Matches(/^[A-Z][A-Z0-9_-]{1,11}$/, { message:'Institution code must be 2–12 uppercase letters/numbers and start with a letter.' }) code:string;
  @ApiProperty({ example:'finance@iiits.in' }) @IsEmail() billingEmail:string;
  @ApiPropertyOptional({ example:500 }) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100000) seats?:number;
  @ApiPropertyOptional({ example:150000 }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(1) annualPrice?:number;
  @ApiPropertyOptional({ example:200 }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) perStudentFee?:number;
}

export class AddOrganizationMemberDto {
  @ApiProperty({ example:'u6' }) @IsString() @IsNotEmpty() userId:string;
}

export class SubmitCourseReviewDto {
  @ApiPropertyOptional({ example:12000 }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) quotedPrice?:number;
  @ApiPropertyOptional({ example:'Includes 12 modules, videos, PDFs and assessments.' }) @IsOptional() @IsString() note?:string;
}

export class CounterOfferDto {
  @ApiProperty({ example:9500 }) @Type(()=>Number) @IsNumber() @Min(0) offeredPrice:number;
  @ApiPropertyOptional({ example:'Budget approved at this amount.' }) @IsOptional() @IsString() message?:string;
}

export class ApproveCourseDto {
  @ApiPropertyOptional({ example:9500 }) @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) sanctionedAmount?:number;
}


export class InstructorMonthlyPayoutDto {
  @ApiPropertyOptional({ example:'2026-08', description:'Billing month in YYYY-MM. Defaults to the current month.' }) @IsOptional() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message:'Month must be YYYY-MM.' }) month?:string;
}

export class InstructorBonusDto {
  @ApiProperty({ example:1500 }) @Type(()=>Number) @IsNumber() @Min(0) amount:number;
  @ApiPropertyOptional({ example:'Excellent learner skill-point growth this month.' }) @IsOptional() @IsString() reason?:string;
}

export class InstructorRateDto {
  @ApiProperty({ example:500 }) @Type(()=>Number) @IsNumber() @Min(0) perStudentMonthlyRate:number;
}
