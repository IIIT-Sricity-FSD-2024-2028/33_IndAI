import { BadRequestException, Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateCourseModuleDto, UpdateCourseModuleDto } from './dto';

const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
function ensureUploadDir() { fs.mkdirSync(uploadDir, { recursive: true }); }
function safeName(name: string) { return String(name || 'video').replace(/[^a-zA-Z0-9._-]/g, '_'); }
function publicVideoUrl(filename: string) { return `http://localhost:3000/uploads/videos/${filename}`; }

@ApiTags('Course Modules')
@Controller()
@ApiRoleHeader()
export class CourseModulesController {
  constructor(private readonly db: DataStore) {}

  @Get('courses/:courseId/modules')
  @Roles('superuser','admin','instructor','provider','learner')
  @ApiOperation({ summary: 'List modules for a course, including uploaded video modules' })
  list(@Param('courseId') courseId: string) {
    if (!this.db.ensureCourseExists(courseId)) throw new NotFoundException('Course not found.');
    return { success: true, data: this.db.courseModules.filter((m: any) => m.courseId === courseId).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) };
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
  uploadVideo(@UploadedFile() file: any, @Body() body: any) {
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

    const videoRow = {
      id: this.db.id('v'),
      providerId: body.providerId || 'u5',
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

    return { success: true, message: 'Video module uploaded successfully.', data: { module: moduleRow, video: videoRow } };
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
      const filePath = path.join(uploadDir, removed.fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    this.db.videoLibrary = this.db.videoLibrary.filter((v: any) => v.moduleId !== id);
    return { success: true, data: { id } };
  }
}
