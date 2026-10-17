import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { SYMBOL_REGEX } from '../../common/validation.constants';
export class CreateWatchlistDto {
  @ApiPropertyOptional({ example: 'Momentum Picks', minLength: 3 }) @IsOptional() @IsString() @MinLength(3) name?: string;
  @ApiPropertyOptional({ type: [String], example: ['TCS','INFY'] }) @IsOptional() @IsArray() @Matches(SYMBOL_REGEX, { each: true, message: 'Invalid stock symbol.' }) symbols?: string[];
}
export class UpdateWatchlistDto {
  @ApiPropertyOptional({ minLength: 3 }) @IsOptional() @IsString() @MinLength(3) name?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @Matches(SYMBOL_REGEX, { each: true, message: 'Invalid stock symbol.' }) symbols?: string[];
}
export class AddWatchlistSymbolDto {
  @ApiProperty({ example: 'TCS' }) @IsString() @IsNotEmpty({ message: 'Symbol is required.' }) @Matches(SYMBOL_REGEX, { message: 'Invalid stock symbol.' }) symbol: string;
}
