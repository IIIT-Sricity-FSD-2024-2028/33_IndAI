import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength } from 'class-validator';
import { EXPERIENCE_LEVELS, INDAI_EMAIL_REGEX, INDIAN_PHONE_REGEX, NAME_REGEX, PASSWORD_REGEX, RISK_TOLERANCES, USER_ROLES, USER_STATUSES } from '../../common/validation.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'New', minLength: 3, description: 'Required. Alphabets and spaces only.' })
  @IsString() @IsNotEmpty({ message: 'First name is required.' }) @MinLength(3, { message: 'First name must be at least 3 characters.' }) @Matches(NAME_REGEX, { message: 'First name can contain only alphabets and spaces.' })
  firstName: string;

  @ApiProperty({ example: 'Learner', minLength: 3, description: 'Required. Alphabets and spaces only.' })
  @IsString() @IsNotEmpty({ message: 'Last name is required.' }) @MinLength(3, { message: 'Last name must be at least 3 characters.' }) @Matches(NAME_REGEX, { message: 'Last name can contain only alphabets and spaces.' })
  lastName: string;

  @ApiProperty({ example: 'new@gmail.com', description: 'Required. Gmail or .in email only.' })
  @IsString() @IsNotEmpty({ message: 'Email is required.' }) @Matches(INDAI_EMAIL_REGEX, { message: 'Use a Gmail address or an email ending in .in.' })
  email: string;

  @ApiProperty({ example: 'Test@1234', minLength: 8, description: 'Required. Min 8 chars, uppercase, lowercase, number, and one of !@#$%^&*.' })
  @IsString() @IsNotEmpty({ message: 'Password is required.' }) @Matches(PASSWORD_REGEX, { message: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.' })
  password: string;

  @ApiPropertyOptional({ example: 'Test@1234', description: 'Optional compatibility field used by frontend/Swagger. If provided, it must match password.' })
  @IsOptional() @IsString()
  confirmPassword?: string;

  @ApiProperty({ enum: USER_ROLES })
  @IsIn(USER_ROLES as any, { message: 'Invalid role.' })
  role: any;

  @ApiPropertyOptional({ enum: USER_STATUSES, example: 'active' })
  @IsOptional() @IsIn(USER_STATUSES as any, { message: 'Invalid status.' })
  status?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Optional but if provided must be 10 digits starting with 6/7/8/9.' })
  @IsOptional() @Matches(INDIAN_PHONE_REGEX, { message: 'Enter a valid 10-digit Indian mobile number.' })
  phone?: string;

  @ApiPropertyOptional({ example: '2007-05-09', description: 'Required by registration frontend. Learner must be at least 10 years old.' })
  @IsOptional() @IsDateString({}, { message: 'Date of Birth must be a valid date.' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'IIIT Sri City', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Institution name must be at least 3 characters.' }) @Matches(/^[^0-9].*$/, { message: 'Institution name cannot start with a number.' })
  institution?: string;

  @ApiPropertyOptional({ example: 'CSE2026', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Student ID must be at least 3 characters.' })
  studentId?: string;

  @ApiPropertyOptional({ example: 'BTech 2nd Year', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Grade / Level must be at least 3 characters.' })
  grade?: string;

  @ApiPropertyOptional({ example: 'Computer Science', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Course / Major must be at least 3 characters when provided.' })
  major?: string;

  @ApiPropertyOptional({ example: 'IndAI Academy', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Organization name must be at least 3 characters.' }) @Matches(/^[^0-9].*$/, { message: 'Organization cannot start with a number.' })
  organization?: string;

  @ApiPropertyOptional({ example: 'Technical Analysis', minLength: 3 })
  @IsOptional() @IsString() @MinLength(3, { message: 'Expertise / Specialization must be at least 3 characters.' })
  expertise?: string;

  @ApiPropertyOptional({ example: '3-5' })
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Years of experience is required for instructors.' })
  yearsExp?: string;

  @ApiPropertyOptional({ example: 5, description: 'Compatibility alias for yearsExp used by some Swagger/frontend payloads.' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(60)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional() @IsUrl({ require_protocol: true, protocols: ['http','https'] }, { message: 'Website / LinkedIn must be a valid URL starting with http:// or https://.' })
  website?: string;

  @ApiPropertyOptional({ example: 'Video Courses' })
  @IsOptional() @IsString()
  contentType?: string;

  @ApiPropertyOptional({ example: 'ADMIN-2026' })
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Authorization code is required.' })
  authCode?: string;

  @ApiPropertyOptional({ example: 'Full' })
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Admin access level is required.' })
  accessLevel?: string;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS })
  @IsOptional() @IsIn(EXPERIENCE_LEVELS as any, { message: 'Invalid experience level.' })
  tradingExperience?: string;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, description: 'Compatibility alias for experience/tradingExperience.' })
  @IsOptional() @IsIn(EXPERIENCE_LEVELS as any, { message: 'Invalid experience level.' })
  experienceLevel?: string;

  @ApiPropertyOptional({ enum: RISK_TOLERANCES })
  @IsOptional() @IsIn(RISK_TOLERANCES as any, { message: 'Invalid risk tolerance.' })
  riskTolerance?: string;

  @ApiPropertyOptional({ example: 100000 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  startingBalance?: number;
  @ApiPropertyOptional({ example: 150000 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  tradingLimit?: number;
  @ApiPropertyOptional({ example: 'u3' }) @IsOptional() @IsString()
  instructorId?: string;

  @ApiPropertyOptional({ example: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  skillPoints?: number;
  @ApiPropertyOptional({ example: 100000 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  portfolioValue?: number;
  @ApiPropertyOptional({ example: 100000 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  virtualBalance?: number;
  @ApiPropertyOptional({ example: 'Beginner' }) @IsOptional() @IsString()
  experience?: string;
  @ApiPropertyOptional({ example: 'Learn paper trading safely' }) @IsOptional() @IsString()
  goals?: string;
  @ApiPropertyOptional({ type: [String], example: [] }) @IsOptional()
  studentIds?: string[];
}


export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @Matches(NAME_REGEX, { message: 'First name can contain only alphabets and spaces.' }) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @Matches(NAME_REGEX, { message: 'Last name can contain only alphabets and spaces.' }) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(INDAI_EMAIL_REGEX, { message: 'Use a Gmail address or an email ending in .in.' }) email?: string;
  @ApiPropertyOptional({ enum: USER_STATUSES }) @IsOptional() @IsIn(USER_STATUSES as any) status?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(INDIAN_PHONE_REGEX, { message: 'Enter a valid 10-digit Indian mobile number.' }) phone?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) tradingLimit?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) skillPoints?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() instructorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @Matches(/^[^0-9].*$/, { message: 'Institution name cannot start with a number.' }) institution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) major?: string;
}
