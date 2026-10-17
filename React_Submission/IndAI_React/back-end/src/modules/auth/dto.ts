import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_ROLES } from '../../common/validation.constants';

export class LoginDto {
  @ApiProperty({ example: 'learner@indai.com', description: 'Required. Frontend allows Gmail or email ending with .in only.' })
  @IsString()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email: string;

  @ApiProperty({ example: 'Learn@1234', description: 'Required password.' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(1)
  password: string;

  @ApiPropertyOptional({ enum: USER_ROLES, example: 'LEARNER', description: 'Optional selected role from frontend login/register.' })
  @IsOptional()
  @IsIn(USER_ROLES as any, { message: 'Invalid role.' })
  role?: string;
}
