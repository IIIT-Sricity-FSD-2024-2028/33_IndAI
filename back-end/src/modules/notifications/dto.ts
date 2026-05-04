import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString } from 'class-validator';
import { NOTIFICATION_TYPES } from '../../common/validation.constants';

export class CreateNotificationDto {
  @ApiProperty({ example: 'u6' }) @IsString() @IsNotEmpty({ message: 'User ID is required.' }) userId: string;
  @ApiPropertyOptional({ example: 'New session scheduled' }) @IsOptional() @IsString() @MinLength(1) title?: string;
  @ApiProperty({ example: 'New session scheduled' }) @IsString() @IsNotEmpty({ message: 'Message is required.' }) message: string;
  @ApiPropertyOptional({ enum: NOTIFICATION_TYPES, example: 'info' }) @IsOptional() @IsIn(NOTIFICATION_TYPES as any, { message: 'Invalid notification type.' }) type?: string;
  @ApiPropertyOptional({ example: false }) @IsOptional() @IsBoolean() read?: boolean;
  @ApiPropertyOptional({ example: 'n1' }) @IsOptional() @IsString() id?: string;
  @ApiPropertyOptional({ example: '2026-05-03T00:00:00.000Z' }) @IsOptional() @IsDateString() createdAt?: string;
}
export class UpdateNotificationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) message?: string;
  @ApiPropertyOptional({ enum: NOTIFICATION_TYPES }) @IsOptional() @IsIn(NOTIFICATION_TYPES as any) type?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() read?: boolean;
}
