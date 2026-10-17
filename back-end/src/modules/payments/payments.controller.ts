import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/roles.decorator';
import { Public } from '../../common/public.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateB2BRazorpayOrderDto, CreateProRazorpayOrderDto, VerifyB2BRazorpayPaymentDto, VerifyProRazorpayPaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments / Razorpay') @Controller('payments/razorpay')
export class PaymentsController{
  constructor(private readonly service:PaymentsService){}

  @Public()
  @Get('config') @ApiOperation({summary:'Public Razorpay checkout configuration. Never returns the Key Secret.'})
  config(){ return {success:true,data:this.service.config()}; }

  @Post('pro/order') @ApiRoleHeader() @Roles('learner') @ApiOperation({summary:'Create a real Razorpay order for a learner Pro subscription'}) @ApiBody({type:CreateProRazorpayOrderDto})
  async proOrder(@Body() body:CreateProRazorpayOrderDto,@Req() req:any){ return {success:true,data:await this.service.createProOrder(body,req.user?.id)}; }

  @Post('pro/verify') @ApiRoleHeader() @Roles('learner') @ApiOperation({summary:'Verify Razorpay signature and activate learner Pro'}) @ApiBody({type:VerifyProRazorpayPaymentDto})
  async proVerify(@Body() body:VerifyProRazorpayPaymentDto,@Req() req:any){ return {success:true,data:await this.service.verifyProPayment(body,req.user?.id)}; }

  @Post('b2b/:orgId/order') @ApiRoleHeader() @Roles('admin','superuser') @ApiOperation({summary:'Payment Admin creates real Razorpay order for an institution license'}) @ApiBody({type:CreateB2BRazorpayOrderDto})
  async b2bOrder(@Param('orgId') orgId:string,@Body() body:CreateB2BRazorpayOrderDto,@Req() req:any){ return {success:true,data:await this.service.createB2BOrder(orgId,body,req.user?.id)}; }

  @Post('b2b/:orgId/verify') @ApiRoleHeader() @Roles('admin','superuser') @ApiOperation({summary:'Verify Razorpay B2B payment and activate institution license'}) @ApiBody({type:VerifyB2BRazorpayPaymentDto})
  async b2bVerify(@Param('orgId') orgId:string,@Body() body:VerifyB2BRazorpayPaymentDto,@Req() req:any){ return {success:true,data:await this.service.verifyB2BPayment(orgId,body,req.user?.id)}; }

  @Public()
  @Post('webhook') @ApiOperation({summary:'Razorpay webhook endpoint. Configure this URL in the Razorpay Dashboard.'})
  webhook(@Req() req:any,@Headers('x-razorpay-signature') signature?:string){ return {success:true,data:this.service.handleWebhook(req.rawBody,signature)}; }
}
