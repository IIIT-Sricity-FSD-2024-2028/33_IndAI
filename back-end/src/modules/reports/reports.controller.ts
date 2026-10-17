import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
@ApiTags('Reports') @Controller('reports') @ApiRoleHeader()
export class ReportsController {
 constructor(private readonly db:DataStore){}
 @Get('platform') @Roles('superuser','admin') platform(){
  const roles=Object.fromEntries(['learner','instructor','provider','admin','superuser'].map(role=>[role,this.db.users.filter(u=>u.role===role).length]));
  const directory=path.join(process.env.DATA_DIR||path.join(process.cwd(),'persistent-data'),'research');
  let orders:any[]=[];
  if(fs.existsSync(directory))for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json'))){try{const account=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));orders.push(...(account.orders||[]));}catch{}}
  const filled=orders.filter(o=>o.status==='FILLED');
  const categories:any={users:'account',courses:'course',quizzes:'quiz','course-modules':'lesson',enrollments:'enrollment',assignments:'assignment',sessions:'session',notifications:'notification',institutes:'institute intake',commercial:'commercial record',account:'profile',algo:'paper order',auth:'session'};
  const activity=this.db.auditLogs.filter(a=>a.action!=='ADMIN_HTTP_ACTION').map(a=>{
   const actor=this.db.getUser(a.actorId),name=actor?`${actor.firstName} ${actor.lastName}`:'Platform';
   let description=a.action==='JWT_SESSION_ISSUED'?'signed in':String(a.action).replaceAll('_',' ').toLowerCase();
   if(a.action==='WORKFLOW_EVENT'){
    const group=String(a.details?.route||'').replace(/^\/api\//,'').replace(/^\//,'').split('/')[0];
    const verb=({POST:'created or submitted',PATCH:'updated',PUT:'updated',DELETE:'removed'} as any)[a.details?.method]||'updated';
    description=`${verb} ${categories[group]||'platform data'}`;
    if(String(a.details?.route).includes('/grade'))description='graded a quiz submission';
    if(String(a.details?.route).includes('upload'))description='uploaded learning content';
    if(String(a.details?.route).includes('notifications/send'))description='sent a student notification';
   }
   return {id:a.id,at:a.createdAt,message:`${name}: ${description}`};
  });
  for(const o of filled)activity.push({id:o.id,at:o.fill.at,message:`Paper ${o.side.toLowerCase()}: ${o.qty} ${o.symbol} at ₹${o.fill.price}`});
  for(const e of this.db.enrollments)activity.push({id:e.id,at:e.enrolledAt,message:`Course enrollment: ${this.db.courses.find(c=>c.id===e.courseId)?.title||'Course'}`});
  const recent=activity.filter(a=>a.at).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,15);
  const attempts=this.db.quizzes.flatMap(q=>q.attempts||[]);
  const dayKey=(value:string|number)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  const onDay=(value:string,day:string)=>Boolean(value)&&Number.isFinite(Date.parse(value))&&dayKey(value)===day;
  const trend=Array.from({length:7},(_,i)=>{const day=dayKey(Date.now()-(6-i)*86400000);return {day,registrations:this.db.users.filter(u=>onDay(u.createdAt,day)).length,enrollments:this.db.enrollments.filter(e=>onDay(e.enrolledAt,day)).length,trades:filled.filter(o=>onDay(o.fill.at,day)).length};});
  return {success:true,data:{users:this.db.users.length,roles,pendingApprovals:this.db.users.filter(u=>u.status==='pending').length,courses:this.db.courses.length,publishedCourses:this.db.courses.filter(c=>c.status==='published').length,enrollments:this.db.enrollments.length,completions:this.db.enrollments.filter(e=>e.status==='completed').length,quizzes:this.db.quizzes.length,quizAttempts:attempts.length,pendingQuizReviews:attempts.filter(a=>a.status==='PENDING_REVIEW').length,trades:filled.length,tradeVolume:filled.reduce((n,o)=>n+o.qty*o.fill.price,0),sessions:this.db.sessions.length,assignments:this.db.assignments.length,revenue:this.db.transactions.filter(t=>t.status==='PAID'&&['PRO_SUBSCRIPTION','B2B_INSTITUTION_LICENSE'].includes(t.type)).reduce((n,t)=>n+Number(t.amount||0),0),recentActivity:recent,trend,generatedAt:new Date().toISOString()}};
 }
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') learner(@Param('learnerId') id:string){const u=this.db.getUser(id);return {success:true,data:{learnerId:id,portfolioValue:u?.portfolioValue||0,virtualBalance:u?.virtualBalance||0,skillPoints:u?.skillPoints||0,generatedAt:new Date().toISOString()}};}
 @Get('course/:courseId') @Roles('superuser','admin','instructor','provider') course(@Param('courseId') id:string){const enrollments=this.db.enrollments.filter(e=>e.courseId===id);return {success:true,data:{course:this.db.courses.find(c=>c.id===id),enrollmentCount:enrollments.length,averageProgress:enrollments.length?Math.round(enrollments.reduce((n,e)=>n+(e.progress||0),0)/enrollments.length):0}};}
}
