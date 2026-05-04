import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
@ApiTags('Reports') @Controller('reports') @ApiRoleHeader()
export class ReportsController { constructor(private readonly db: DataStore) {}
 @Get('platform') @Roles('superuser','admin') @ApiOperation({summary:'Generate platform performance report'}) platform(){ return {success:true,data:{users:this.db.users.length,learners:this.db.users.filter(u=>u.role==='learner').length,courses:this.db.courses.length,trades:this.db.trades.length,sessions:this.db.sessions.length,assignments:this.db.assignments.length,generatedAt:new Date().toISOString()}}; }
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Generate learner performance report'}) learner(@Param('learnerId') id:string){ const p=this.db.refreshPortfolio(id); return {success:true,data:{learnerId:id,totalTrades:p?.trades?.length||0,portfolioValue:p?.user?.portfolioValue||0,virtualBalance:p?.user?.virtualBalance||0,skillPoints:p?.user?.skillPoints||0,generatedAt:new Date().toISOString()}}; }
 @Get('course/:courseId') @Roles('superuser','admin','instructor','provider') @ApiOperation({summary:'Generate course report'}) course(@Param('courseId') id:string){ const course=this.db.courses.find((c:any)=>c.id===id); const enrollments=this.db.enrollments.filter((e:any)=>e.courseId===id); return {success:true,data:{course,enrollmentCount:enrollments.length,averageProgress:enrollments.length?Math.round(enrollments.reduce((s:any,e:any)=>s+(e.progress||0),0)/enrollments.length):0}}; }
}
