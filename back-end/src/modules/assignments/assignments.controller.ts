import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateAssignmentDto, SubmitAssignmentDto, UpdateAssignmentDto } from './dto';
@ApiTags('Assignments') @Controller('assignments') @ApiRoleHeader()
export class AssignmentsController { constructor(private readonly service:AssignmentsService){}
 @Get() @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List assignments'}) all(){return {success:true,data:this.service.findAll()};}
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'List learner assignments'}) byLearner(@Param('learnerId') learnerId:string){return {success:true,data:this.service.findByLearner(learnerId)};}
 @Get(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Get one assignment'}) one(@Param('id') id:string){return {success:true,data:this.service.findOne(id)};}
 @Post() @Roles('superuser','admin','instructor','provider') @ApiOperation({summary:'Create assignment'}) @ApiBody({type:CreateAssignmentDto}) create(@Body() b:CreateAssignmentDto){return {success:true,data:this.service.create(b)};}
 @Patch(':id') @Roles('superuser','admin','instructor','provider') @ApiOperation({summary:'Update assignment'}) @ApiBody({type:UpdateAssignmentDto}) update(@Param('id') id:string,@Body() b:UpdateAssignmentDto){return{success:true,data:this.service.update(id,b)};}
 @Post(':id/submit') @Roles('superuser','learner') @ApiOperation({summary:'Submit assignment'}) @ApiBody({type:SubmitAssignmentDto}) submit(@Param('id') id:string,@Body() b:SubmitAssignmentDto){return{success:true,data:this.service.submit(id,b.learnerId,b)};}
 @Post(':id/approve/:learnerId') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Approve learner assignment completion'}) approve(@Param('id') id:string,@Param('learnerId') learnerId:string){return{success:true,data:this.service.approve(id,learnerId)};}
 @Delete(':id') @Roles('superuser','admin','instructor','provider') @ApiOperation({summary:'Delete assignment'}) remove(@Param('id') id:string){return{success:true,data:this.service.remove(id)};}
}
