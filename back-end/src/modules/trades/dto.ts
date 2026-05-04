import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
import { SYMBOL_REGEX } from '../../common/validation.constants';
export class CreateTradeDto {
  @ApiProperty({example:'u6'}) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId:string;
  @ApiProperty({example:'TCS'}) @IsString() @IsNotEmpty({ message: 'Symbol is required.' }) @Matches(SYMBOL_REGEX, { message: 'Invalid stock symbol.' }) symbol:string;
  @ApiProperty({enum:['BUY','SELL']}) @IsIn(['BUY','SELL'], { message: 'Order type must be BUY or SELL.' }) type:'BUY'|'SELL';
  @ApiPropertyOptional({enum:['MARKET','LIMIT','STOP_LOSS'], example:'MARKET'}) @IsOptional() @IsIn(['MARKET','LIMIT','STOP_LOSS'], { message: 'Invalid order category.' }) orderCategory?:string;
  @ApiProperty({example:10, minimum:1}) @Type(() => Number) @IsInt({ message: 'Quantity must be a positive whole number.' }) @IsPositive({ message: 'Quantity must be a positive whole number.' }) qty:number;
  @ApiPropertyOptional({example:3850, minimum:0.01}) @IsOptional() @Type(() => Number) @IsNumber() @IsPositive({ message: 'Price must be positive.' }) price?:number;
}
export class CreateOrderDto {
  @ApiProperty({example:'u6'}) @IsString() @IsNotEmpty({ message: 'Learner ID is required.' }) learnerId:string;
  @ApiProperty({example:'TCS'}) @IsString() @IsNotEmpty({ message: 'Symbol is required.' }) @Matches(SYMBOL_REGEX, { message: 'Invalid stock symbol.' }) symbol:string;
  @ApiProperty({enum:['BUY','SELL']}) @IsIn(['BUY','SELL'], { message: 'Order type must be BUY or SELL.' }) orderType:'BUY'|'SELL';
  @ApiPropertyOptional({enum:['MARKET','LIMIT','STOP_LOSS'], example:'MARKET'}) @IsOptional() @IsIn(['MARKET','LIMIT','STOP_LOSS'], { message: 'Invalid order category.' }) orderCategory?:string;
  @ApiProperty({example:10, minimum:1}) @Type(() => Number) @IsInt({ message: 'Quantity must be a positive whole number.' }) @IsPositive({ message: 'Quantity must be a positive whole number.' }) quantity:number;
  @ApiPropertyOptional({example:3850, minimum:0.01}) @IsOptional() @Type(() => Number) @IsNumber() @IsPositive({ message: 'Price must be positive.' }) price?:number;
}
