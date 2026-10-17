import { Body, Controller, Get, Headers, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CommercialService } from './commercial.service';
import { AddOrganizationMemberDto, ApproveCourseDto, CounterOfferDto, CreateOrganizationDto, InstructorBonusDto, InstructorMonthlyPayoutDto, InstructorRateDto, SubmitCourseReviewDto } from './dto';

@ApiTags('Commercial / Revenue Model') @ApiRoleHeader() @Controller('commercial')
export class CommercialController{
  constructor(private readonly service:CommercialService){}
  @Get('compensation/instructors') @Roles('superuser','admin') compensation(@Req() req:any){return {success:true,data:this.service.compensationUsers(req.user.id)}}
  @Get('plans') @Roles('superuser','admin','instructor','provider','learner') plans(){return{success:true,data:this.service.plans()}}
  @Get('subscriptions/user/:userId') @Roles('superuser','admin','learner') userSub(@Param('userId') id:string,@Req() req:any){return{success:true,data:this.service.userSubscription(id,req.user?.id)}}
  @Get('organizations') @Roles('superuser','admin') organizations(){return{success:true,data:this.service.organizations()}}
  @Post('organizations') @Roles('superuser','admin') @ApiBody({type:CreateOrganizationDto}) orgCreate(@Body() b:CreateOrganizationDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.createOrganization(b,uid)}}
  @Post('organizations/:id/members') @Roles('superuser','admin') @ApiBody({type:AddOrganizationMemberDto}) orgMember(@Param('id') id:string,@Body() b:AddOrganizationMemberDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.addOrganizationMember(id,b,uid)}}
  @Get('organizations/:id/overview') @Roles('superuser','admin') orgOverview(@Param('id') id:string){return{success:true,data:this.service.organizationOverview(id)}}

  @Post('courses/:id/submit-review') @Roles('provider') @ApiBody({type:SubmitCourseReviewDto}) submit(@Param('id') id:string,@Body() b:SubmitCourseReviewDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.submitCourse(id,b,uid)}}
  @Get('courses/pending-review') @Roles('superuser','admin') pending(@Headers('x-user-id') uid:string){return{success:true,data:this.service.pendingCourses(uid)}}
  @Post('courses/:id/counter-offer') @Roles('superuser','admin') @ApiBody({type:CounterOfferDto}) counter(@Param('id') id:string,@Body() b:CounterOfferDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.counterOffer(id,b,uid)}}
  @Post('courses/:id/accept-offer') @Roles('provider') accept(@Param('id') id:string,@Headers('x-user-id') uid:string){return{success:true,data:this.service.acceptOffer(id,uid)}}
  @Post('courses/:id/approve') @Roles('superuser','admin') @ApiBody({type:ApproveCourseDto}) approve(@Param('id') id:string,@Body() b:ApproveCourseDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.approveCourse(id,b,uid)}}
  @Get('courses/:id/negotiation') @Roles('superuser','admin','provider') negotiation(@Param('id') id:string,@Headers('x-user-id') uid:string){return{success:true,data:this.service.negotiation(id,uid)}}

  @Get('providers/:id/earnings') @Roles('superuser','admin','provider') providerEarn(@Param('id') id:string,@Headers('x-user-id') uid:string){return{success:true,data:this.service.providerEarnings(id,uid)}}
  @Get('instructors/:id/earnings') @Roles('superuser','admin','instructor') instructorEarn(@Param('id') id:string,@Headers('x-user-id') uid:string){return{success:true,data:this.service.instructorEarnings(id,uid)}}
  @Post('instructors/:id/pay-month') @Roles('superuser','admin') @ApiBody({type:InstructorMonthlyPayoutDto}) payMonth(@Param('id') id:string,@Body() b:InstructorMonthlyPayoutDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.payInstructorMonth(id,b,uid)}}
  @Patch('instructors/:id/rate') @Roles('superuser','admin') @ApiBody({type:InstructorRateDto}) rate(@Param('id') id:string,@Body() b:InstructorRateDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.setInstructorRate(id,b,uid)}}
  @Post('instructors/:id/bonus') @Roles('superuser','admin') @ApiBody({type:InstructorBonusDto}) bonus(@Param('id') id:string,@Body() b:InstructorBonusDto,@Headers('x-user-id') uid:string){return{success:true,data:this.service.addInstructorBonus(id,b,uid)}}
  @Get('revenue/summary') @Roles('superuser','admin') @ApiOperation({summary:'Payment Admin revenue dashboard: B2C Pro, B2B institutional licensing, per-student commission and payouts'}) revenue(@Headers('x-user-id') uid:string){return{success:true,data:this.service.revenueSummary(uid)}}
  @Get('admin-team') @Roles('superuser') team(){return{success:true,data:this.service.adminTeam()}}
}
