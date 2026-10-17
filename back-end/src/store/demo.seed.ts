import * as fs from 'fs';
import * as path from 'path';
import type { DataStore, Role, User } from './data.store';
import { hashPassword } from '../common/password.util';

/** Public sample data. Called once for a new demo store, never for a restored store. */
export function seedLinkedDemo(db: DataStore) {
  const now = new Date().toISOString();
  const future = (days:number) => new Date(Date.now()+days*86400000).toISOString();
  const account = (id:string, firstName:string, lastName:string, email:string, password:string, role:Role, extra:Partial<User>={}) => ({
    id,firstName,lastName,email,password:hashPassword(password),role,status:'active',skillPoints:0,
    startingBalance:role==='learner'?100000:0,virtualBalance:role==='learner'?100000:0,
    portfolioValue:role==='learner'?100000:0,tradingLimit:role==='learner'?150000:0,...extra,
  });
  db.users.push(
    account('demo_super','Kiran','Owner','superadmin.demo@indai.com','Admin@1234','superuser'),
    account('demo_admin','Ananya','Users','useradmin.demo@indai.com','Admin@1234','admin',{adminTeam:'USER_ADMIN'}),
    account('demo_payment','Dev','Payments','paymentadmin.demo@indai.com','Pay@1234','admin',{adminTeam:'PAYMENT_ADMIN'}),
    account('demo_instructor','Kavya','Rao','instructor.demo@indai.com','Inst@1234','instructor',{organizationId:'demo_org',institution:'IndAI Demo College',studentIds:['demo_neha','demo_vikram'],expertise:'Risk Management',instructorMonthlyRate:500}),
    account('demo_provider','Arjun','Academy','provider.demo@indai.com','Prov@1234','provider',{organizationId:'demo_org',institution:'IndAI Demo College',organization:'IndAI Demo College',providerVerified:true}),
    account('demo_asha','Asha','Nair','asha.demo@indai.com','Learn@1234','learner',{organizationId:'org1',institution:'IIIT Sri City',instructorId:'u3',subscriptionTier:'FREE',learnerLevel:'BEGINNER'}),
    account('demo_neha','Neha','Reddy','neha.demo@indai.com','Learn@1234','learner',{organizationId:'demo_org',institution:'IndAI Demo College',instructorId:'demo_instructor',subscriptionTier:'FREE',learnerLevel:'BEGINNER'}),
    account('demo_vikram','Vikram','Shah','vikram.demo@indai.com','Learn@1234','learner',{organizationId:'demo_org',institution:'IndAI Demo College',instructorId:'demo_instructor',subscriptionTier:'FREE',learnerLevel:'BEGINNER'}),
  );
  db.getUser('u3')!.studentIds=['u6','demo_asha'];
  db.organizations.push({id:'demo_org',name:'IndAI Demo College',billingEmail:'office.demo@example.in',status:'active',licenseStatus:'ACTIVE',licenseStartedAt:now,licenseEndsAt:future(365),seats:25,annualPrice:0,perStudentFee:0,memberCount:4,createdAt:now});
  db.subscriptions.push({id:'demo_license',customerType:'ORGANIZATION',customerId:'demo_org',planId:'b2b_institute',status:'ACTIVE',amount:0,startedAt:now,renewsAt:future(365),gateway:'DEMO_GRANT'});
  for(const [id,providerId,title,scope,organizationId] of [
    ['demo_course_public','u5','Paper Trading Risk Workshop','PLATFORM',undefined],
    ['demo_course_private','demo_provider','Demo College Risk Lab','ORGANIZATION','demo_org'],
  ]) {
    db.courses.push({id,providerId,title,description:'Educational demo: watch the short lesson, read the workbook and submit a risk plan.',category:'Fundamentals',difficulty:'BEGINNER',accessTier:'FREE',scope,organizationId,status:'published',reviewStatus:'APPROVED',quotedPrice:0,sanctionedAmount:0,providerPayoutStatus:'NOT_APPLICABLE',skillPoints:25,lessons:2,duration:'20 minutes',enrolledCount:2,completedCount:0,rating:0});
    const videoId=id+'_video',videoUrl='/uploads/videos/demo-risk-lesson.webm',pdfUrl='/uploads/materials/demo-risk-workbook.pdf';
    db.courseModules.push(
      {id:videoId,courseId:id,type:'video',title:'Risk Budget in Paper Trading',description:'Short educational sample clip with a virtual-trading checklist.',duration:'8 sec',order:1,url:videoUrl,videoUrl,fileName:'demo-risk-lesson.webm',originalName:'risk-lesson.webm',status:'published',uploadedAt:now},
      {id:id+'_pdf',courseId:id,type:'document',materialType:'PDF',title:'Paper Trading Risk Workbook',description:'A worked virtual-risk example and practice exercise.',duration:'PDF',order:2,url:pdfUrl,pdfUrl,fileName:'demo-risk-workbook.pdf',originalName:'risk-workbook.pdf',status:'published',proOnly:false,uploadedAt:now},
    );
    // Each module has its own file so deleting one course cannot break another course's media.
    const mediaBase=id==='demo_course_public'?'demo-public':'demo-private';
    const video=db.courseModules.find(m=>m.id===videoId),pdf=db.courseModules.find(m=>m.id===id+'_pdf');
    video.fileName=mediaBase+'.webm';video.url=video.videoUrl='/uploads/videos/'+video.fileName;
    pdf.fileName=mediaBase+'.pdf';pdf.url=pdf.pdfUrl='/uploads/materials/'+pdf.fileName;
    db.videoLibrary.push({id:id+'_library',providerId,courseId:id,moduleId:videoId,title:video.title,description:video.description,status:'published',views:0,duration:'8 sec',sizeMB:Number((fs.statSync(path.join(process.cwd(),'data','demo','risk-lesson.webm')).size/(1024*1024)).toFixed(2)),uploadedAt:now,sourceName:'risk-lesson.webm',videoUrl:video.videoUrl});
    db.quizzes.push({id:id+'_quiz',courseId:id,title:'Risk Budget Check',accessTier:'FREE',questions:[{q:'With virtual capital of 100000, what is a 1% risk budget?',options:['100','1000','10000'],ans:1},{q:'Does paper trading place a real exchange order?',options:['Yes','No'],ans:1}],createdBy:providerId,providerId,status:'active',attempts:0,avgScore:0});
    const ids=id==='demo_course_public'?['u6','demo_asha']:['demo_neha','demo_vikram'];
    for(const learnerId of ids)db.enrollments.push({id:id+'_'+learnerId,learnerId,courseId:id,progress:0,status:'in_progress',completedModuleIds:[],enrolledAt:now});
  }
  for(const [id,instructorId,studentIds,title] of [
    ['demo_assignment_public','u3',['u6','demo_asha'],'Virtual Risk Plan'],
    ['demo_assignment_private','demo_instructor',['demo_neha','demo_vikram'],'Demo College Risk Plan'],
  ] as const){
    db.assignments.push({id,instructorId,studentIds:[...studentIds],title,description:'Use the risk workbook. Submit entry, stop, quantity and risk budget for a virtual trade.',completedIds:[],submissions:[],status:'active',dueDate:future(7).slice(0,10),skillPoints:30,difficulty:'Medium'});
    db.sessions.push({id:id+'_session',instructorId,studentIds:[...studentIds],title:title+' Review',description:'Discuss the workbook and review virtual-trade risk.',status:'scheduled',date:future(3).slice(0,10),time:'14:00'});
    for(const userId of studentIds) db.notifications.push({id:id+'_'+userId,userId,senderId:instructorId,title:'Risk workshop ready',message:'Your instructor assigned a risk plan. Open your workshop course for the video and workbook.',type:'info',read:false,createdAt:now});
  }
  // One pending sample submission; no points are awarded until the instructor approves it.
  db.assignments.find(a=>a.id==='demo_assignment_private').submissions.push({learnerId:'demo_vikram',submissionText:'Virtual capital 100000; risk budget 1000; entry 200; stop 190; maximum 100 shares. Check available cash before placing the order.',submittedAt:now});
  db.feedback.push({id:'demo_feedback',instructorId:'demo_instructor',learnerId:'demo_vikram',message:'Sample feedback: explain the risk calculation before approval.',rating:4,createdAt:now});
  for(const org of db.organizations)org.memberCount=db.users.filter(u=>u.organizationId===org.id).length;
  for(const course of db.courses){course.enrolledCount=db.enrollments.filter(e=>e.courseId===course.id).length;course.lessons=db.courseModules.filter(m=>m.courseId===course.id).length;}
  const uploads=path.join(process.env.DATA_DIR||process.cwd(),'uploads');
  for(const prefix of ['demo-public','demo-private']){
    for(const [folder,source,target] of [['videos','risk-lesson.webm',prefix+'.webm'],['materials','risk-workbook.pdf',prefix+'.pdf']]){
      fs.mkdirSync(path.join(uploads,folder),{recursive:true});
      fs.copyFileSync(path.join(process.cwd(),'data','demo',source),path.join(uploads,folder,target));
    }
  }
}
