import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto';
@ApiTags('Feedback') @Controller('feedback') @ApiRoleHeader()
export class FeedbackController { constructor(private readonly db:DataStore){}
 @Get() @Roles('superuser','admin','instructor') all(){return {success:true,data:this.db.feedback};}
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') learner(@Param('learnerId') id:string){return {success:true,data:this.db.feedback.filter((f:any)=>f.learnerId===id)};}
 @Post() @Roles('superuser','admin','instructor') @ApiOperation({summary:'Create feedback'}) @ApiBody({type:CreateFeedbackDto}) create(@Body() b:CreateFeedbackDto){ const instructor=this.db.getUser(b.instructorId); if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.'); if(!this.db.ensureLearnerExists(b.learnerId)) throw new NotFoundException('Learner not found.'); const row={id:this.db.id('f'),rating:0,...b,message:b.message.trim(),createdAt:new Date().toISOString()}; this.db.feedback.push(row); return {success:true,data:row};}
 @Patch(':id') @Roles('superuser','admin','instructor') @ApiBody({type:UpdateFeedbackDto}) update(@Param('id') id:string,@Body() b:UpdateFeedbackDto){const row=this.db.feedback.find((f:any)=>f.id===id); if(!row) throw new NotFoundException('Feedback not found.'); Object.assign(row,b); return {success:true,data:row};}
 @Delete(':id') @Roles('superuser','admin','instructor') remove(@Param('id') id:string){const i=this.db.feedback.findIndex((f:any)=>f.id===id); if(i===-1) throw new NotFoundException('Feedback not found.'); this.db.feedback.splice(i,1); return {success:true,data:{id}};}
}
