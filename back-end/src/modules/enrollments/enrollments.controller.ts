import { BadRequestException, Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateEnrollmentDto, UpdateProgressDto } from './dto';
@ApiTags('Enrollments') @Controller('enrollments') @ApiRoleHeader()
export class EnrollmentsController { constructor(private readonly db:DataStore){}
 @Get() @Roles('superuser','admin','instructor') @ApiOperation({summary:'List enrollments'}) all(){return {success:true,data:this.db.enrollments};}
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'List learner enrollments'}) learner(@Param('learnerId') id:string){return {success:true,data:this.db.enrollments.filter((e:any)=>e.learnerId===id)};}
 @Post() @Roles('superuser','admin','learner') @ApiOperation({summary:'Enroll learner in course'}) @ApiBody({type:CreateEnrollmentDto}) create(@Body() b:CreateEnrollmentDto){ if(!this.db.ensureLearnerExists(b.learnerId)) throw new NotFoundException('Learner not found.'); if(!this.db.ensureCourseExists(b.courseId)) throw new NotFoundException('Course not found.'); if(this.db.enrollments.some((e:any)=>e.learnerId===b.learnerId&&e.courseId===b.courseId)) throw new ConflictException('Learner is already enrolled in this course.'); const row={id:this.db.id('e'),learnerId:b.learnerId,courseId:b.courseId,progress:0,status:'in_progress',enrolledAt:new Date().toISOString()}; this.db.enrollments.push(row); return {success:true,data:row}; }
 @Patch(':id/progress') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Update enrollment progress'}) @ApiBody({type:UpdateProgressDto}) update(@Param('id') id:string,@Body() b:UpdateProgressDto){ const row=this.db.enrollments.find((e:any)=>e.id===id); if(!row) throw new NotFoundException('Enrollment not found.'); row.progress=b.progress; row.status=b.status || (row.progress>=100?'completed':'in_progress'); return {success:true,data:row}; }
 @Delete(':id') @Roles('superuser','admin') @ApiOperation({summary:'Delete enrollment'}) remove(@Param('id') id:string){ const idx=this.db.enrollments.findIndex((e:any)=>e.id===id); if(idx===-1) throw new NotFoundException('Enrollment not found.'); this.db.enrollments.splice(idx,1); return {success:true,data:{id}}; }
}
