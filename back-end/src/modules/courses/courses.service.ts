import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { CreateCourseDto, UpdateCourseDto } from './dto';
@Injectable()
export class CoursesService {
  constructor(private readonly db:DataStore){}
  findAll(){ return this.db.courses; }
  findPublished(){ return this.db.courses.filter((c:any)=>c.status === 'published'); }
  findByProvider(providerId:string){ return this.db.courses.filter((c:any)=>c.providerId === providerId); }
  findOne(id:string){ const row=this.db.courses.find((x:any)=>x.id===id); if(!row) throw new NotFoundException('Course not found.'); return row; }
  create(body:CreateCourseDto){
    const provider=this.db.getUser(body.providerId); if(!provider || provider.role !== 'provider') throw new NotFoundException('Provider not found.');
    if(this.db.courses.some((c:any)=>String(c.title).trim().toLowerCase()===body.title.trim().toLowerCase())) throw new ConflictException('Course title already exists.');
    const row={id:this.db.id('c'),status:'draft',enrolledCount:0,completedCount:0,rating:0,...body,title:body.title.trim(),description:body.description.trim(),createdAt:new Date().toISOString()}; this.db.courses.push(row); return row;
  }
  update(id:string, body:UpdateCourseDto){ const row=this.findOne(id); if(body.providerId){ const provider=this.db.getUser(body.providerId); if(!provider || provider.role !== 'provider') throw new NotFoundException('Provider not found.'); } if(body.title && this.db.courses.some((c:any)=>c.id!==id && String(c.title).trim().toLowerCase()===body.title!.trim().toLowerCase())) throw new ConflictException('Course title already exists.'); Object.assign(row, body); return row; }
  remove(id:string){ const idx=this.db.courses.findIndex((x:any)=>x.id===id); if(idx===-1) throw new NotFoundException('Course not found.'); this.db.courses.splice(idx,1); return {id}; }
}
