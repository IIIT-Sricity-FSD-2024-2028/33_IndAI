import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
@Injectable()
export class NotificationsService { constructor(private readonly db:DataStore){}
 findAll(){ return this.db.notifications; }
 findByUser(userId:string){ return this.db.notifications.filter((n:any)=>n.userId===userId); }
 findOne(id:string){ const row=this.db.notifications.find((x:any)=>x.id===id); if(!row) throw new NotFoundException('Notification not found.'); return row; }
 create(body:CreateNotificationDto){ const user=this.db.getUser(body.userId); if(!user) throw new NotFoundException('User not found.'); const row={id:this.db.id('n'),read:false,type:'info',...body,message:body.message.trim(),createdAt:new Date().toISOString()}; this.db.notifications.push(row); return row; }
 update(id:string, body:UpdateNotificationDto){ const row=this.findOne(id); Object.assign(row, body); return row; }
 markRead(id:string){ const row=this.findOne(id); row.read=true; return row; }
 remove(id:string){ const idx=this.db.notifications.findIndex((x:any)=>x.id===id); if(idx===-1) throw new NotFoundException('Notification not found.'); this.db.notifications.splice(idx,1); return {id}; }
}
