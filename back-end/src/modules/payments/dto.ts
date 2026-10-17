import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProRazorpayOrderDto {
  @ApiProperty({ example:'u6' }) @IsString() @IsNotEmpty() userId:string;
  @ApiProperty({ example:'pro_monthly' }) @IsString() @IsNotEmpty() planId:string;
}

export class VerifyProRazorpayPaymentDto extends CreateProRazorpayOrderDto {
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_order_id:string;
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_payment_id:string;
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_signature:string;
}

export class CreateB2BRazorpayOrderDto {
  @ApiProperty({ example:150000, description:'Final annual license amount agreed by the institution and Payment Admin.' })
  @Type(()=>Number) @IsNumber() @Min(1) amount:number;
}

export class VerifyB2BRazorpayPaymentDto extends CreateB2BRazorpayOrderDto {
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_order_id:string;
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_payment_id:string;
  @ApiProperty() @IsString() @IsNotEmpty() razorpay_signature:string;
}
