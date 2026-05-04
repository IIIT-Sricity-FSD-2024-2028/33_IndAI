import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto';
function assertFutureWithin365(dateValue?: string){ const d=new Date(String(dateValue||'')); const now=new Date(); now.setHours(0,0,0,0); const max=new Date(now); max.setDate(max.getDate()+365); if(!Number.isFinite(d.getTime()) || d<=now || d>max) throw new BadRequestException('Due date must be within the next 365 days.'); }
@Injectable()
export class AssignmentsService { constructor(private readonly db:DataStore){}
 findAll(){ return this.db.assignments; }
 findOne(id:string){ const row=this.db.assignments.find((x:any)=>x.id===id); if(!row) throw new NotFoundException('Assignment not found.'); return row; }
 findByLearner(learnerId:string){ return this.db.assignments.filter((a:any)=>(a.studentIds||[]).includes(learnerId)); }
 create(body:CreateAssignmentDto){
  const instructor=this.db.getUser(body.instructorId); if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
  assertFutureWithin365(body.dueDate);
  for(const id of body.studentIds||[]){ if(!this.db.ensureLearnerExists(id)) throw new NotFoundException(`Learner not found: ${id}`); }
  const row={id:this.db.id('a'),completedIds:[],status:'active',...body,title:body.title.trim(),description:body.description.trim(),createdAt:new Date().toISOString()}; this.db.assignments.push(row); return row;
 }
 update(id:string, body:UpdateAssignmentDto){ const row=this.findOne(id); if(body.instructorId){ const instructor=this.db.getUser(body.instructorId); if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.'); } if(body.dueDate) assertFutureWithin365(body.dueDate); for(const sid of body.studentIds||[]){ if(!this.db.ensureLearnerExists(sid)) throw new NotFoundException(`Learner not found: ${sid}`); } Object.assign(row, body); return row; }
 submit(id:string, learnerId:string, body:any={}){ const row=this.findOne(id); if(!learnerId) throw new BadRequestException('learnerId is required.'); if(!this.db.ensureLearnerExists(learnerId)) throw new NotFoundException('Learner not found.'); if(row.studentIds?.length && !row.studentIds.includes(learnerId)) throw new BadRequestException('Learner is not assigned to this assignment.'); row.submissions = row.submissions || []; if(row.submissions.some((s:any)=>s.learnerId===learnerId)) throw new ConflictException('Assignment already submitted by this learner.'); row.submissions.push({learnerId, submittedAt:new Date().toISOString(), ...body}); return row; }
 approve(id:string, learnerId:string){ const row=this.findOne(id); if(!this.db.ensureLearnerExists(learnerId)) throw new NotFoundException('Learner not found.'); row.completedIds = [...new Set([...(row.completedIds||[]), learnerId])]; const learner=this.db.getUser(learnerId); if(learner) learner.skillPoints=(learner.skillPoints||0)+(row.skillPoints||0); return row; }
 remove(id:string){ const idx=this.db.assignments.findIndex((x:any)=>x.id===id); if(idx===-1) throw new NotFoundException('Assignment not found.'); this.db.assignments.splice(idx,1); return {id}; }
}
