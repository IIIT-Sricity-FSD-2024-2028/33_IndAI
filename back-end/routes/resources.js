import express from 'express';
import { basename,extname } from 'node:path';
import { ensure,log } from '../db.js';
import { id,read,z } from '../validation.js';
import { approved } from '../services/access.js';
import { canReadCourse,canReadAssignment,canReadQuiz,courseAuthor } from '../services/learning-access.js';
import { removeResourceLink } from '../services/resources.js';

export function resourcePermission(db,user,kind,target,write=false) {
  approved(user);
  if(kind==='course' || kind==='lesson') {
    const course=kind==='lesson'?db.get('SELECT course FROM lessons WHERE id=?',target)?.course:target;
    ensure(course,404,'RESOURCE_TARGET_NOT_FOUND','Lesson or course not found.');
    const item=canReadCourse(db,user,course,!write);
    if(write) ensure(courseAuthor(user) && item.owner===user.id && item.state==='draft',403,'DRAFT_REQUIRED','Resources may be changed only on your draft courses.');
  } else if(kind==='assignment' || kind==='submission') {
    const submission=kind==='submission'?db.get('SELECT * FROM submissions WHERE id=?',target):null;
    ensure(kind!=='submission' || submission,404,'SUBMISSION_NOT_FOUND','Submission not found.');
    const item=canReadAssignment(db,user,submission?.assignment || target);
    if(write) ensure(item.relationship_state==='active' && (kind==='submission'?item.student===user.id && !submission.reviewed:item.staff===user.id),
      403,'FORBIDDEN','Only active coursework authors can upload here. Reviewed submissions are final.');
  } else {
    const item=canReadQuiz(db,user,target);
    if(write) ensure(item.owner===user.id && item.state==='draft',403,'DRAFT_REQUIRED','Only your draft quiz may be changed.');
  }
}
const kindSchema=z.enum(['course','lesson','assignment','submission','quiz']);
export function resourceRoutes(app,db,auth) {
  const target=(req,write=false)=>{
    const kind=read(kindSchema,req.params.kind);
    const targetId=read(id,req.params.id);
    resourcePermission(db,req.user,kind,targetId,write);
    return {kind,target:targetId};
  };
  app.get('/api/resources/:kind/:id',auth,(req,res)=>{
    const selected=target(req);
    res.json(db.all(`SELECT l.id,r.name,r.mime,r.size,r.created FROM resource_links l JOIN resources r ON r.id=l.resource
      WHERE l.kind=? AND l.target=? ORDER BY l.id`,selected.kind,selected.target));
  });
  app.post('/api/resources/:kind/:id/upload',auth,
    (req,res,next)=>{target(req,true);next();},
    express.raw({type:['application/pdf','video/mp4','video/webm'],limit:'100mb'}),
    (req,res)=>{
      const selected=target(req,true);
      let filename;
      try {filename=decodeURIComponent(req.get('x-file-name')||'');} catch {ensure(false,422,'INVALID_FILENAME','Invalid filename.');}
      filename=basename(filename.replaceAll('\\','/')).replace(/[\x00-\x1f\x7f]/g,'').slice(0,180);
      const mime=req.get('content-type')?.split(';')[0].trim();
      const extension=extname(filename).toLowerCase();
      const data=req.body;
      const valid=Buffer.isBuffer(data) && data.length>0 &&
        ((mime==='application/pdf' && extension==='.pdf' && data.subarray(0,5).toString()==='%PDF-') ||
         (mime==='video/mp4' && extension==='.mp4' && data.subarray(4,8).toString()==='ftyp') ||
         (mime==='video/webm' && extension==='.webm' && data.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]))));
      ensure(valid,422,'INVALID_FILE','Upload a valid PDF, MP4, or WebM matching its extension, up to 100 MB.');
      const link=db.tx(()=>{
        ensure(db.get('SELECT count(*) n FROM resource_links WHERE kind=? AND target=?',selected.kind,selected.target).n<10,409,'RESOURCE_LIMIT','Use at most 10 resources per item.');
        const resource=db.run('INSERT INTO resources(owner,name,mime,size,bytes,created) VALUES (?,?,?,?,?,?)',req.user.id,filename,mime,data.length,data,Date.now()).lastInsertRowid;
        return db.run('INSERT INTO resource_links(resource,kind,target) VALUES (?,?,?)',resource,selected.kind,selected.target).lastInsertRowid;
      });
      res.status(201).json({id:link});
    });
  app.delete('/api/resource-files/:id',auth,(req,res)=>{
    const link=db.get('SELECT * FROM resource_links WHERE id=?',read(id,req.params.id));
    ensure(link,404,'RESOURCE_NOT_FOUND','Resource not found.');
    resourcePermission(db,req.user,link.kind,link.target,true);
    db.tx(()=>removeResourceLink(db,link));
    res.json({ok:true});
  });
  app.get('/api/resource-files/:id',auth,(req,res)=>{
    const row=db.get(`SELECT l.*,r.name,r.mime,r.size FROM resource_links l JOIN resources r ON r.id=l.resource WHERE l.id=?`,read(id,req.params.id));
    ensure(row,404,'RESOURCE_NOT_FOUND','Resource not found.');
    resourcePermission(db,req.user,row.kind,row.target);
    let start=0,end=row.size-1;
    if(req.get('range')) {
      const range=/^bytes=(\d*)-(\d*)$/.exec(req.get('range'));
      if(!range || (!range[1]&&!range[2])) {res.set('Content-Range','bytes */'+row.size);return res.sendStatus(416);}
      if(!range[1]) start=Math.max(0,row.size-Number(range[2]));
      else {start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);}
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=row.size) {res.set('Content-Range','bytes */'+row.size);return res.sendStatus(416);}
      res.status(206).set('Content-Range',`bytes ${start}-${end}/${row.size}`);
    }
    res.set({'Content-Type':row.mime,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes',
      'Content-Disposition':"inline; filename*=UTF-8''"+encodeURIComponent(row.name),'Cache-Control':'private, no-store'});
    if(start===0) log(db,req.user.id,'resource.view',row.id,{kind:row.kind,target:row.target});
    res.send(Buffer.from(db.get('SELECT substr(bytes,?,?) data FROM resources WHERE id=?',start+1,end-start+1,row.resource).data));
  });
}
