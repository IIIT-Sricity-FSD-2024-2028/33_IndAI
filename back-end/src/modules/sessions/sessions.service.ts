import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { CreateSessionDto, UpdateSessionDto } from './dto';
function assertFutureWithin365(dateValue?: string){ const d=new Date(String(dateValue||'')); const now=new Date(); now.setHours(0,0,0,0); const max=new Date(now); max.setDate(max.getDate()+365); if(!Number.isFinite(d.getTime()) || d<=now || d>max) throw new BadRequestException('Session date must be within the next 365 days.'); }
@Injectable()
export class SessionsService { constructor(private readonly db:DataStore){}
 findAll(){ return this.db.sessions; }
 findOne(id:string){ const row=this.db.sessions.find((x:any)=>x.id===id); if(!row) throw new NotFoundException('Session not found.'); return row; }
 findByLearner(learnerId:string){ return this.db.sessions.filter((s:any)=>(s.studentIds||[]).includes(learnerId)); }
 create(body:CreateSessionDto){ const instructor=this.db.getUser(body.instructorId); if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.'); assertFutureWithin365(body.date); for(const sid of body.studentIds||[]){ if(!this.db.ensureLearnerExists(sid)) throw new NotFoundException(`Learner not found: ${sid}`); } const row={id:this.db.id('s'),status:'scheduled',...body,title:body.title.trim(),createdAt:new Date().toISOString()}; this.db.sessions.push(row); return row; }
 update(id:string, body:UpdateSessionDto){ const row=this.findOne(id); if(body.instructorId){ const instructor=this.db.getUser(body.instructorId); if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.'); } if(body.date) assertFutureWithin365(body.date); for(const sid of body.studentIds||[]){ if(!this.db.ensureLearnerExists(sid)) throw new NotFoundException(`Learner not found: ${sid}`); } Object.assign(row, body); return row; }
 remove(id:string){ const idx=this.db.sessions.findIndex((x:any)=>x.id===id); if(idx===-1) throw new NotFoundException('Session not found.'); this.db.sessions.splice(idx,1); return {id}; }
}
