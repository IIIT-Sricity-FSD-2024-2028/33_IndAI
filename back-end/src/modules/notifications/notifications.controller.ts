import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
@ApiTags('Notifications') @Controller('notifications') @ApiRoleHeader()
export class NotificationsController { constructor(private readonly service:NotificationsService){}
 @Get() @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List all notifications'}) all(){return {success:true,data:this.service.findAll()};}
 @Get('user/:userId') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List notifications by user'}) byUser(@Param('userId') userId:string){return {success:true,data:this.service.findByUser(userId)};}
 @Get(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Get one notification'}) one(@Param('id') id:string){return {success:true,data:this.service.findOne(id)};}
 @Post() @Roles('superuser','admin','instructor','provider') @ApiOperation({summary:'Create notification'}) @ApiBody({type:CreateNotificationDto}) create(@Body() b:CreateNotificationDto){return {success:true,data:this.service.create(b)};}
 @Patch(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Update notification'}) @ApiBody({type:UpdateNotificationDto}) update(@Param('id') id:string,@Body() b:UpdateNotificationDto){return{success:true,data:this.service.update(id,b)};}
 @Patch(':id/read') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Mark notification as read'}) read(@Param('id') id:string){return{success:true,data:this.service.markRead(id)};}
 @Delete(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Delete notification'}) remove(@Param('id') id:string){return{success:true,data:this.service.remove(id)};}
}
