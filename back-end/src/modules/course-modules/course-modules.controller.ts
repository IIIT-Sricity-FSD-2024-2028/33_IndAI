import { BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Headers, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { signModule, signMediaUrl } from '../../common/media.util';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateCourseModuleDto, UpdateCourseModuleDto } from './dto';

const uploadDir = path.join(process.env.DATA_DIR || process.cwd(), 'uploads', 'videos');
const materialUploadDir = path.join(process.env.DATA_DIR || process.cwd(), 'uploads', 'materials');
function ensureUploadDir() { fs.mkdirSync(uploadDir, { recursive: true }); }
function ensureMaterialUploadDir() { fs.mkdirSync(materialUploadDir, { recursive: true }); }
function safeName(name: string) { return String(name || 'video').replace(/[^a-zA-Z0-9._-]/g, '_'); }
function publicVideoUrl(filename: string) { return `/uploads/videos/${encodeURIComponent(filename)}`; }
function publicMaterialUrl(filename: string) { return `/uploads/materials/${encodeURIComponent(filename)}`; }

@ApiTags('Course Modules')
@Controller()
@ApiRoleHeader()
export class CourseModulesController {
  constructor(private readonly db: DataStore) {}

  private assertUploadOwner(courseId:string,req:any,file:any){const course=this.db.courses.find(c=>c.id===courseId);if(req.user.role==='provider'&&course?.providerId!==req.user.id){try{fs.unlinkSync(file.path);}catch{}throw new ForbiddenException('Upload only to your own courses.');}}
  @Get('courses/:courseId/modules')
  @Roles('superuser','admin','instructor','provider','learner')
  @ApiOperation({ summary: 'List modules for a course, including uploaded video modules' })
  list(@Param('courseId') courseId: string, @Headers('x-role') rawRole?:string, @Headers('x-user-id') userId?:string) {
    const course=this.db.ensureCourseExists(courseId); if (!course) throw new NotFoundException('Course not found.');
    if(String(rawRole||'').toLowerCase()==='provider'&&course.providerId!==userId)throw new ForbiddenException('This course belongs to another provider.');
    const isLearner=String(rawRole||'').toUpperCase()==='LEARNER';
    if(isLearner){
      const learner=userId?this.db.ensureLearnerExists(userId):null; if(!learner) throw new ForbiddenException('Learner identity is required to access course material.');
      if(course.status!=='published'||!this.db.enrollments.some(e=>e.courseId===courseId&&e.learnerId===userId))throw new ForbiddenException('Enroll in a published course to access its lessons.');
      if(course.accessTier==='PRO'&&!this.db.hasPro(userId!)) throw new ForbiddenException('This course requires an active IndAI Pro subscription.');
      if(course.scope==='ORGANIZATION'&&course.organizationId&&learner.organizationId!==course.organizationId) throw new ForbiddenException('This course is private to another institution.');
    }
    const rows=this.db.courseModules.filter((m: any) => m.courseId === courseId).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const data=isLearner&&!this.db.hasPro(userId||'') ? rows.map((m:any)=>{ if(!m.proOnly)return m; const {url,pdfUrl,fileName,...locked}=m; return {...locked,locked:true}; }) : rows;
    return { success: true, data:data.map(m=>signModule(m)) };
  }

  @Post('courses/:courseId/modules')
  @Roles('superuser','admin','provider')
  @ApiOperation({ summary: 'Create course module' })
  @ApiBody({ type: CreateCourseModuleDto })
  create(@Param('courseId') courseId: string, @Body() b: CreateCourseModuleDto) {
    if (!this.db.ensureCourseExists(courseId)) throw new NotFoundException('Course not found.');
    if (this.db.courseModules.some((m: any) => m.courseId === courseId && String(m.title).trim().toLowerCase() === b.title.trim().toLowerCase())) {
      throw new ConflictException('Module title already exists for this course.');
    }
    const row = { id: this.db.id('m'), courseId, ...b, title: b.title.trim(), createdAt: new Date().toISOString() };
    this.db.courseModules.push(row);
    this.db.ensureCourseExists(courseId).lessons = this.db.courseModules.filter(m=>m.courseId===courseId).length;
    return { success: true, data: row };
  }

  @Post('course-modules/upload-video')
  @Roles('superuser','admin','provider')
  @UseInterceptors(FileInterceptor('video', {
    storage: diskStorage({
      destination: (_req, _file, cb) => { ensureUploadDir(); cb(null, uploadDir); },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.mp4';
        const base = path.basename(file.originalname || 'video', ext);
        cb(null, `${Date.now()}_${safeName(base)}${ext}`);
      }
    }),
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = /\.(mp4|webm|mov|mkv|avi)$/i.test(file.originalname || '') || ['video/mp4','video/webm','video/quicktime','video/x-matroska','video/x-msvideo'].includes(file.mimetype);
      cb(ok ? null : new BadRequestException('Only MP4, WEBM, MOV, MKV or AVI video files are allowed.'), ok);
    }
  }))
  @ApiOperation({ summary: 'Upload a video lesson to a specific course as a module' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['courseId', 'title', 'video'],
      properties: {
        courseId: { type: 'string', example: 'c1' },
        afterModuleId: { type: 'string', example: 'm1', description: 'Optional module after which the uploaded video should be inserted.' },
        title: { type: 'string', minLength: 3, example: 'Introduction to Candlestick Charts' },
        description: { type: 'string', example: 'Video lesson for learners.' },
        duration: { type: 'string', example: '12:34' },
        video: { type: 'string', format: 'binary' }
      }
    }
  })
  uploadVideo(@UploadedFile() file: any, @Body() body: any, @Req() req:any) {
    const courseId = String(body.courseId || '').trim();
    const title = String(body.title || '').trim();
    const description = String(body.description || 'Uploaded video lesson for learners.').trim();
    const duration = String(body.duration || 'Video').trim();
    const afterModuleId = String(body.afterModuleId || '').trim();

    if (!file) throw new BadRequestException('Video file is required.');
    if (!courseId) throw new BadRequestException('Course ID is required.');
    if (!title || title.length < 3) throw new BadRequestException('Module title must be at least 3 characters.');
    if (!this.db.ensureCourseExists(courseId)) throw new NotFoundException('Course not found.');
    if (this.db.courseModules.some((m: any) => m.courseId === courseId && String(m.title).trim().toLowerCase() === title.toLowerCase())) {
      throw new ConflictException('Module title already exists for this course.');
    }

    this.assertUploadOwner(courseId,req,file);
    const sameCourseModules = this.db.courseModules.filter((m: any) => m.courseId === courseId).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    let insertOrder = sameCourseModules.length + 1;
    if (afterModuleId) {
      const anchor = sameCourseModules.find((m: any) => m.id === afterModuleId);
      if (!anchor) throw new NotFoundException('Selected placement module not found.');
      insertOrder = (anchor.order || 0) + 1;
      sameCourseModules.filter((m: any) => (m.order || 0) >= insertOrder).forEach((m: any) => { m.order = (m.order || 0) + 1; });
    }

    const videoUrl = publicVideoUrl(file.filename);
    const moduleRow = {
      id: this.db.id('m'),
      courseId,
      type: 'video',
      title,
      description,
      duration,
      order: insertOrder,
      url: videoUrl,
      videoUrl,
      fileName: file.filename,
      originalName: file.originalname,
      sizeMB: Math.max(1, Math.round((file.size || 0) / (1024 * 1024))),
      status: 'published',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.db.courseModules.push(moduleRow);
    this.db.ensureCourseExists(courseId).lessons = this.db.courseModules.filter(m=>m.courseId===courseId).length;
    this.db.enrollments.filter(e=>e.courseId===courseId).forEach(e=>this.db.notifications.push({id:this.db.id("n"),userId:e.learnerId,message:`New video lesson added: ${title}`,type:"course",read:false,createdAt:new Date().toISOString()}));

    const videoRow = {
      id: this.db.id('v'),
      providerId: req.user.id,
      courseId,
      moduleId: moduleRow.id,
      title,
      description,
      status: 'published',
      views: 0,
      duration,
      sizeMB: moduleRow.sizeMB,
      uploadedAt: moduleRow.uploadedAt,
      sourceName: file.originalname,
      videoUrl
    };
    this.db.videoLibrary.push(videoRow);

    return { success: true, message: 'Video module uploaded successfully.', data: { module: signModule(moduleRow), video: {...videoRow,videoUrl:signMediaUrl(videoRow.videoUrl)} } };
  }

  @Post('course-modules/upload-pdf')
  @Roles('superuser','admin','provider')
  @UseInterceptors(FileInterceptor('pdf', {
    storage: diskStorage({
      destination: (_req, _file, cb) => { ensureMaterialUploadDir(); cb(null, materialUploadDir); },
      filename: (_req, file, cb) => {
        const base = path.basename(file.originalname || 'material.pdf', path.extname(file.originalname || 'material.pdf'));
        cb(null, `${Date.now()}_${safeName(base)}.pdf`);
      }
    }),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = /\.pdf$/i.test(file.originalname || '') || file.mimetype === 'application/pdf';
      cb(ok ? null : new BadRequestException('Only PDF course materials are allowed.'), ok);
    }
  }))
  @ApiOperation({ summary: 'Upload a PDF learning material to a course as a learner-visible module' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema:{ type:'object', required:['courseId','title','pdf'], properties:{ courseId:{type:'string',example:'c1'}, title:{type:'string',example:'Risk Management Workbook'}, description:{type:'string'}, providerId:{type:'string',example:'u5'}, proOnly:{type:'boolean',example:false}, pdf:{type:'string',format:'binary'} } } })
  uploadPdf(@UploadedFile() file:any, @Body() body:any, @Req() req:any){
    const courseId=String(body.courseId||'').trim(); const title=String(body.title||'').trim();
    if(!file) throw new BadRequestException('PDF file is required.');
    if(!courseId || !this.db.ensureCourseExists(courseId)) throw new NotFoundException('Course not found.');
    if(title.length<3) throw new BadRequestException('Material title must be at least 3 characters.');
    this.assertUploadOwner(courseId,req,file);
    const same=this.db.courseModules.filter((m:any)=>m.courseId===courseId);
    const url=publicMaterialUrl(file.filename);
    const row={id:this.db.id('m'),courseId,type:'document',materialType:'PDF',title,description:String(body.description||'PDF learning material').trim(),duration:'PDF',order:same.length+1,url,pdfUrl:url,fileName:file.filename,originalName:file.originalname,sizeMB:Number(((file.size||0)/(1024*1024)).toFixed(2)),proOnly:String(body.proOnly||'false')==='true',status:'published',uploadedAt:new Date().toISOString()};
    this.db.courseModules.push(row);
    this.db.ensureCourseExists(courseId).lessons = this.db.courseModules.filter(m=>m.courseId===courseId).length;
    this.db.enrollments.filter((e:any)=>e.courseId===courseId).forEach((e:any)=>this.db.notifications.push({id:this.db.id('n'),userId:e.learnerId,message:`New PDF learning material added: ${title}`,type:'course',read:false,createdAt:new Date().toISOString()}));
    return {success:true,message:'PDF course material uploaded successfully.',data:signModule(row)};
  }

  @Patch('course-modules/:id')
  @Roles('superuser','admin','provider')
  @ApiOperation({ summary: 'Update course module' })
  @ApiBody({ type: UpdateCourseModuleDto })
  update(@Param('id') id: string, @Body() b: UpdateCourseModuleDto) {
    const row = this.db.courseModules.find((m: any) => m.id === id);
    if (!row) throw new NotFoundException('Module not found.');
    if (b.title && this.db.courseModules.some((m: any) => m.id !== id && m.courseId === row.courseId && String(m.title).trim().toLowerCase() === b.title!.trim().toLowerCase())) {
      throw new ConflictException('Module title already exists for this course.');
    }
    Object.assign(row, b);
    return { success: true, data: row };
  }

  @Delete('course-modules/:id')
  @Roles('superuser','admin','provider')
  @ApiOperation({ summary: 'Delete course module' })
  remove(@Param('id') id: string) {
    const i = this.db.courseModules.findIndex((m: any) => m.id === id);
    if (i === -1) throw new NotFoundException('Module not found.');
    const [removed] = this.db.courseModules.splice(i, 1);
    if (removed?.fileName) {
      const filePath = path.join(removed.type === 'document' ? materialUploadDir : uploadDir, removed.fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    this.db.videoLibrary = this.db.videoLibrary.filter((v: any) => v.moduleId !== id);
    return { success: true, data: { id } };
  }
}
