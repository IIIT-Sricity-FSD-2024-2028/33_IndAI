import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import {randomUUID} from 'crypto';
import {signMediaUrl} from '../../common/media.util';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateQuizDto, GradeQuizDto, SubmitQuizDto, UpdateQuizDto } from './dto';
@ApiTags('Quizzes') @Controller('quizzes') @ApiRoleHeader()
export class QuizzesController {
  constructor(private readonly db:DataStore) {}
  private get(id:string) { const q=this.db.quizzes.find(x=>x.id===id); if(!q)throw new NotFoundException('Quiz not found.');return q; }
  private visible(q:any,user:any) {
    if(user.role==='provider')return (q.providerId||q.createdBy)===user.id;
    if(user.role!=='learner')return true;
    const course=this.db.courses.find(c=>c.id===q.courseId);
    return q.status!=='inactive' && (!q.courseId || Boolean(course && course.status==='published' && (course.scope!=='ORGANIZATION'||!course.organizationId||course.organizationId===user.organizationId)));
  }
  private present(q:any,user:any) {
    if(user.role!=='learner')return {...q,...(q.pdfUrl?{pdfUrl:signMediaUrl(q.pdfUrl)}:{})};
    const {attempts,...rest}=q;
    const course=this.db.courses.find(c=>c.id===q.courseId);
    const pdfAccess=!q.pdfUrl || this.db.enrollments.some(e=>e.courseId===q.courseId&&e.learnerId===user.id)&&(!(q.proOnly||course?.accessTier==='PRO')||this.db.hasPro(user.id));
    return {...rest,pdfUrl:q.pdfUrl&&pdfAccess?signMediaUrl(q.pdfUrl):undefined,locked:!pdfAccess,questions:(q.questions||[]).map(({ans,...item}:any)=>item),attempts:(attempts||[]).filter((a:any)=>a.learnerId===user.id)};
  }
  private validate(questions:any) {
    if(!Array.isArray(questions)||questions.length<1||questions.length>50)throw new BadRequestException('A quiz must have 1 to 50 questions.');
    for(const q of questions)if(typeof q.q!=='string'||!q.q.trim()||!Array.isArray(q.options)||q.options.length<2||q.options.length>6||q.options.some((o:any)=>typeof o!=='string'||!o.trim())||!Number.isInteger(q.ans)||q.ans<0||q.ans>=q.options.length)throw new BadRequestException('Each question needs text, 2 to 6 nonempty options and a valid correct answer.');
  }
  @Post('upload-pdf') @Roles('provider','superuser','admin')
  @UseInterceptors(FileInterceptor('pdf',{
   storage:diskStorage({destination:(_req,_file,cb)=>{const dir=path.join(process.env.DATA_DIR||process.cwd(),'uploads','materials');fs.mkdirSync(dir,{recursive:true});cb(null,dir);},filename:(_req,_file,cb)=>cb(null,`quiz_${randomUUID()}.pdf`)}),
   limits:{fileSize:25*1024*1024},fileFilter:(_req,file,cb)=>{const ok=/\.pdf$/i.test(file.originalname)&&file.mimetype==='application/pdf';cb(ok?null:new BadRequestException('Choose a PDF question paper.'),ok);}
  })) uploadPdf(@UploadedFile() file:any,@Body() body:any,@Req() req:any){
   if(!file)throw new BadRequestException('A PDF question paper is required.');
   try{
    const header=Buffer.alloc(5),fd=fs.openSync(file.path,'r');try{fs.readSync(fd,header,0,5,0);}finally{fs.closeSync(fd);}
    if(header.toString()!=='%PDF-')throw new BadRequestException('This file is not a valid PDF.');
    const title=String(body.title||'').trim(),courseId=String(body.courseId||''),status=String(body.status||'active');
    if(title.length<3||!['active','inactive'].includes(status))throw new BadRequestException('Enter a title of at least 3 characters and a valid status.');
    const course=this.db.courses.find(c=>c.id===courseId);if(!course)throw new NotFoundException('Course not found.');
    if(req.user.role==='provider'&&course.providerId!==req.user.id)throw new ForbiddenException('Choose your own course.');
    let q=body.quizId?this.get(body.quizId):null;
    if(q&&req.user.role==='provider'&&(q.providerId||q.createdBy)!==req.user.id)throw new ForbiddenException('This quiz belongs to another provider.');
    if(q&&q.attempts?.length)throw new BadRequestException('A quiz with submissions cannot have its question paper replaced. Create a new quiz.');
    if(!q){q={id:this.db.id('q'),providerId:course.providerId,createdBy:req.user.id,attempts:[],createdAt:new Date().toISOString()};this.db.quizzes.push(q);}
    const old=q.pdfFileName;
    Object.assign(q,{title,courseId,status,kind:'PDF',questions:[],pdfUrl:'/uploads/materials/'+file.filename,pdfFileName:file.filename,originalName:file.originalname,instructions:String(body.instructions||'Read the PDF and submit your answers below.'),totalPoints:100});
    if(old&&old!==file.filename){try{fs.unlinkSync(path.join(path.dirname(file.path),path.basename(old)));}catch{}}
    return {success:true,data:this.present(q,req.user)};
   }catch(e){try{fs.unlinkSync(file.path);}catch{}throw e;}
  }
  @Post(':id/attempts/:attemptId/grade') @Roles('superuser','admin','provider','instructor') grade(@Param('id') id:string,@Param('attemptId') attemptId:string,@Body() b:GradeQuizDto,@Req() req:any){
   const q=this.get(id);if(req.user.role==='instructor'&&q.createdBy!==req.user.id)throw new ForbiddenException('Only the quiz creator may review this submission.');
   const attempt=(q.attempts||[]).find(a=>a.id===attemptId);if(!attempt||q.kind!=='PDF')throw new NotFoundException('PDF submission not found.');
   Object.assign(attempt,{score:b.score,total:100,feedback:b.feedback||'',passed:b.score>=Number(q.passingScore||60),status:'GRADED',gradedAt:new Date().toISOString(),gradedBy:req.user.id});
   this.db.notifications.push({id:this.db.id('n'),userId:attempt.learnerId,message:`Your PDF quiz "${q.title}" was graded: ${b.score}/100`,type:'course',read:false,createdAt:new Date().toISOString()});
   return {success:true,data:attempt};
  }
  @Get() @Roles('superuser','admin','instructor','provider','learner') all(@Req() req:any) {return {success:true,data:this.db.quizzes.filter(q=>this.visible(q,req.user)).map(q=>this.present(q,req.user))};}
  @Get(':id') @Roles('superuser','admin','instructor','provider','learner') one(@Param('id') id:string,@Req() req:any) {const q=this.get(id);if(!this.visible(q,req.user))throw new ForbiddenException('This quiz is not available to your account.');return {success:true,data:this.present(q,req.user)};}
  @Post() @Roles('superuser','admin','instructor','provider') @ApiBody({type:CreateQuizDto}) create(@Body() b:CreateQuizDto,@Req() req:any) {
    if(b.courseId&&!this.db.ensureCourseExists(b.courseId))throw new NotFoundException('Course not found.');this.validate(b.questions);
    if(b.status&&!['active','inactive'].includes(b.status))throw new BadRequestException('Invalid status.');
    const q={id:this.db.id('q'),...b,providerId:req.user.role==='provider'?req.user.id:b.providerId,createdBy:req.user.id,attempts:[],status:b.status||'active',createdAt:new Date().toISOString()};this.db.quizzes.push(q);return {success:true,data:q};
  }
  @Patch(':id') @Roles('superuser','admin','instructor','provider') @ApiBody({type:UpdateQuizDto}) update(@Param('id') id:string,@Body() b:UpdateQuizDto) {const q=this.get(id);if(b.courseId&&!this.db.ensureCourseExists(b.courseId))throw new NotFoundException('Course not found.');if(b.questions!==undefined&&q.kind!=='PDF')this.validate(b.questions);if(b.status&&!['active','inactive'].includes(b.status))throw new BadRequestException('Invalid status.');Object.assign(q,b);return {success:true,data:q};}
  @Delete(':id') @Roles('superuser','admin','instructor','provider') remove(@Param('id') id:string) {const q=this.get(id);if(q.pdfFileName){try{fs.unlinkSync(path.join(process.env.DATA_DIR||process.cwd(),'uploads','materials',path.basename(q.pdfFileName)));}catch{}}this.db.quizzes=this.db.quizzes.filter(x=>x.id!==id);return {success:true,data:{id}};}
  @Post(':id/submit') @Roles('superuser','learner') @ApiBody({type:SubmitQuizDto}) submit(@Param('id') id:string,@Body() b:SubmitQuizDto) {
    const q=this.get(id),learner=this.db.ensureLearnerExists(b.learnerId);if(!learner)throw new NotFoundException('Learner not found.');if(!this.visible(q,learner))throw new ForbiddenException('This quiz is not available.');if(q.kind!=='PDF')this.validate(q.questions);
    const course=this.db.courses.find(c=>c.id===q.courseId);
    if((q.accessTier==='PRO'||q.proOnly||q.enhanced||course?.accessTier==='PRO')&&!this.db.hasPro(learner.id))throw new BadRequestException('This quiz requires an active Pro subscription.');
    if(course&&!this.db.enrollments.some(e=>e.courseId===course.id&&e.learnerId===learner.id))throw new BadRequestException('Enroll in the course before taking its quiz.');
    if(q.kind==='PDF'){
     if(!b.submissionText||b.submissionText.trim().length<3)throw new BadRequestException('Enter your answers before submitting.');
     q.attempts=q.attempts||[];
     if(q.attempts.some(a=>a.learnerId===learner.id&&a.status==='PENDING_REVIEW'))throw new BadRequestException('Your previous submission is awaiting review.');
     const result={id:this.db.id('qa'),quizId:id,learnerId:learner.id,submissionText:b.submissionText.trim(),score:null,total:100,status:'PENDING_REVIEW',passed:false,submittedAt:new Date().toISOString()};q.attempts.push(result);return {success:true,data:result};
    }
    if(!b.answers)throw new BadRequestException('Answer every question.');
    if(b.answers.length!==q.questions.length||b.answers.some((n,i)=>n<0||n>=q.questions[i].options.length))throw new BadRequestException('Answer every question before submitting.');
    const score=q.questions.reduce((sum:number,item:any,i:number)=>sum+(b.answers[i]===item.ans?1:0),0),total=q.questions.length;
    const passed=score/total*100>=Number(q.passingScore||60);q.attempts=q.attempts||[];
    const previouslyPassed=q.attempts.some((a:any)=>a.learnerId===learner.id&&a.passed);
    const awarded=passed&&!previouslyPassed?Number(q.skillPointsOnPass||0):0;
    const result={id:this.db.id('qa'),quizId:id,learnerId:learner.id,score,total,passed,awarded,submittedAt:new Date().toISOString()};q.attempts.push(result);learner.skillPoints+=awarded;
    return {success:true,data:result};
  }
}
