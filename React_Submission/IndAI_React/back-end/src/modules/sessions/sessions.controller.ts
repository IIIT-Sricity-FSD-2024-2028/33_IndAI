import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateSessionDto, UpdateSessionDto } from './dto';
@ApiTags('Sessions') @Controller('sessions') @ApiRoleHeader()
export class SessionsController { constructor(private readonly service:SessionsService){}
 @Get() @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List sessions'}) all(){return {success:true,data:this.service.findAll()};}
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'List learner sessions'}) byLearner(@Param('learnerId') learnerId:string){return {success:true,data:this.service.findByLearner(learnerId)};}
 @Get(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Get one session'}) one(@Param('id') id:string){return {success:true,data:this.service.findOne(id)};}
 @Post() @Roles('superuser','admin','instructor') @ApiOperation({summary:'Create session'}) @ApiBody({type:CreateSessionDto}) create(@Body() b:CreateSessionDto){return {success:true,data:this.service.create(b)};}
 @Patch(':id') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Update session'}) @ApiBody({type:UpdateSessionDto}) update(@Param('id') id:string,@Body() b:UpdateSessionDto){return{success:true,data:this.service.update(id,b)};}
 @Delete(':id') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Delete session'}) remove(@Param('id') id:string){return{success:true,data:this.service.remove(id)};}
}
