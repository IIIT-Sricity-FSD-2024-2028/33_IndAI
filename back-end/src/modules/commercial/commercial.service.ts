import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { AddOrganizationMemberDto, ApproveCourseDto, CounterOfferDto, CreateOrganizationDto, InstructorBonusDto, InstructorMonthlyPayoutDto, InstructorRateDto, SubmitCourseReviewDto } from './dto';

@Injectable()
export class CommercialService {
  constructor(private readonly db:DataStore){}

  private actor(userId?:string){ return userId ? this.db.getUser(userId) : null; }
  private requirePaymentAdmin(userId?:string){
    const u=this.actor(userId);
    if(!u || !((u.role==='admin' && u.adminTeam==='PAYMENT_ADMIN') || u.role==='superuser')) throw new ForbiddenException('Payment Admin or Super Admin access required.');
    return u;
  }
  private requireUserAdmin(userId?:string){
    const u=this.actor(userId);
    if(!u || !((u.role==='admin' && u.adminTeam==='USER_ADMIN') || u.role==='superuser')) throw new ForbiddenException('User Admin or Super Admin access required.');
    return u;
  }

  compensationUsers(id:string){this.requirePaymentAdmin(id);return this.db.users.filter(u=>u.role==='instructor').map(u=>this.db.safeUser(u));}
  plans(){ return this.db.subscriptionPlans; }
  userSubscription(userId:string,actorId?:string){
    const actor=actorId?this.db.getUser(actorId):null;
    if(!actor) throw new ForbiddenException('Authenticated user required.');
    if(actor.role==='learner' && actor.id!==userId) throw new ForbiddenException('Learners can view only their own subscription.');
    const user=this.db.getUser(userId); if(!user) throw new NotFoundException('User not found.');
    const active=this.db.subscriptions.find((s:any)=>s.customerType==='USER'&&s.customerId===userId&&s.status==='ACTIVE');
    const plan=active?this.db.subscriptionPlans.find((p:any)=>p.id===active.planId):null;
    return {tier:user.subscriptionTier||'FREE',subscription:active||null,plan:plan||null};
  }
  organizations(){ return this.db.organizations; }
  createOrganization(dto:CreateOrganizationDto,actorId?:string){
    this.requireUserAdmin(actorId);
    if(this.db.organizations.some((o:any)=>String(o.name).toLowerCase()===dto.name.trim().toLowerCase() || String(o.code||'').toUpperCase()===dto.code.trim().toUpperCase())) throw new ConflictException('Institution name or code already exists.');
    const seats=Number(dto.seats||500); const annualPrice=Number(dto.annualPrice||150000); const perStudentFee=Number(dto.perStudentFee ?? this.db.config.institutionPerStudentFee ?? 200);
    const row={id:this.db.id('org'),name:dto.name.trim(),code:dto.code.trim().toUpperCase(),billingEmail:dto.billingEmail.toLowerCase(),status:'pending_payment',licenseStatus:'PENDING_PAYMENT',seats,annualPrice,perStudentFee,memberCount:0,createdAt:new Date().toISOString()};
    this.db.organizations.push(row);
    this.db.audit('INSTITUTION_CREATED',actorId,{organizationId:row.id,name:row.name,seats:row.seats,annualPrice:row.annualPrice});
    return {organization:row,transaction:null,message:'Institution workspace created. Payment Admin must activate the paid B2B license before members are distributed.'};
  }
  addOrganizationMember(orgId:string,dto:AddOrganizationMemberDto,actorId?:string){
    this.requireUserAdmin(actorId);
    const org=this.db.organizations.find((o:any)=>o.id===orgId); if(!org) throw new NotFoundException('Institution not found.');
    if(org.licenseStatus!=='ACTIVE') throw new BadRequestException('Institution license is not active. Payment Admin must complete B2B activation first.');
    const user=this.db.getUser(dto.userId); if(!user) throw new NotFoundException('User not found.');
    user.organizationId=org.id; user.institution=org.name;
    org.memberCount=this.db.users.filter((u:any)=>u.organizationId===org.id).length;
    this.db.audit('INSTITUTION_MEMBER_UPDATED',actorId,{organizationId:org.id,userId:user.id,role:user.role});
    return {organization:org,user:this.db.safeUser(user)};
  }
  organizationOverview(orgId:string){
    const org=this.db.organizations.find((o:any)=>o.id===orgId); if(!org) throw new NotFoundException('Institution not found.');
    const members=this.db.users.filter((u:any)=>u.organizationId===orgId); const learners=members.filter((u:any)=>u.role==='learner');
    const perStudent=Number(org.perStudentFee||this.db.config.institutionPerStudentFee||200); const studentRevenue=learners.length*perStudent;
    return {organization:org,members:this.db.safeUsers(members),counts:{learners:learners.length,instructors:members.filter((u:any)=>u.role==='instructor').length,providers:members.filter((u:any)=>u.role==='provider').length},revenue:{annualLicense:Number(org.annualPrice||0),perStudent,studentRevenue,total:Number(org.annualPrice||0)+studentRevenue}};
  }

  submitCourse(courseId:string,dto:SubmitCourseReviewDto,providerId:string){
    const course=this.db.courses.find((c:any)=>c.id===courseId); if(!course) throw new NotFoundException('Course not found.');
    if(course.providerId!==providerId) throw new ForbiddenException('Providers can submit only their own courses.');
    const provider=this.db.getUser(providerId); if(!provider||provider.role!=='provider') throw new ForbiddenException('Provider account required.');
    if(provider.status!=='active' || provider.providerVerified!==true) throw new ForbiddenException('Course Provider must be verified before submitting courses.');
    course.quotedPrice=Number(dto.quotedPrice ?? course.quotedPrice ?? 0); course.status='pending_review'; course.reviewStatus='PENDING_ADMIN_REVIEW'; course.submittedAt=new Date().toISOString();
    const n={id:this.db.id('neg'),courseId,providerId,providerQuote:course.quotedPrice,status:'OPEN',messages:[{by:'PROVIDER',amount:course.quotedPrice,message:dto.note||'Course submitted for commercial review.',at:new Date().toISOString()}]};
    this.db.courseNegotiations.push(n); this.db.audit('COURSE_SUBMITTED_FOR_COMMERCIAL_REVIEW',providerId,{courseId,quotedPrice:course.quotedPrice}); return {course,negotiation:n};
  }
  pendingCourses(actorId?:string){ this.requirePaymentAdmin(actorId); return this.db.courses.filter((c:any)=>['pending_review','negotiation'].includes(c.status)); }
  counterOffer(courseId:string,dto:CounterOfferDto,actorId?:string){
    this.requirePaymentAdmin(actorId); const course=this.db.courses.find((c:any)=>c.id===courseId); if(!course) throw new NotFoundException('Course not found.');
    if(!['pending_review','negotiation'].includes(course.status)) throw new BadRequestException('Course is not awaiting commercial review.');
    course.status='negotiation'; course.reviewStatus='COUNTER_OFFER'; course.adminOffer=Number(dto.offeredPrice);
    let n=this.db.courseNegotiations.find((x:any)=>x.courseId===courseId&&x.status==='OPEN'); if(!n){n={id:this.db.id('neg'),courseId,providerId:course.providerId,status:'OPEN',messages:[]};this.db.courseNegotiations.push(n);}
    n.adminOffer=Number(dto.offeredPrice); n.messages.push({by:'PAYMENT_ADMIN',amount:Number(dto.offeredPrice),message:dto.message||'Counter offer proposed by IndAI.',at:new Date().toISOString()}); this.db.audit('COURSE_COUNTER_OFFER_SENT',actorId,{courseId,offeredPrice:Number(dto.offeredPrice)}); return {course,negotiation:n};
  }
  acceptOffer(courseId:string,providerId:string){
    const course=this.db.courses.find((c:any)=>c.id===courseId); if(!course) throw new NotFoundException('Course not found.'); if(course.providerId!==providerId) throw new ForbiddenException();
    if(course.adminOffer===undefined) throw new BadRequestException('No admin counter offer exists.'); course.acceptedPrice=Number(course.adminOffer); course.reviewStatus='OFFER_ACCEPTED';
    const n=this.db.courseNegotiations.find((x:any)=>x.courseId===courseId&&x.status==='OPEN'); if(n)n.messages.push({by:'PROVIDER',amount:course.acceptedPrice,message:'Provider accepted the counter offer.',at:new Date().toISOString()}); return {course,negotiation:n||null};
  }
  approveCourse(courseId:string,dto:ApproveCourseDto,actorId?:string){
    this.requirePaymentAdmin(actorId); const course=this.db.courses.find((c:any)=>c.id===courseId); if(!course) throw new NotFoundException('Course not found.');
    if(course.status==='published' && course.reviewStatus==='APPROVED')return {course,negotiation:this.db.courseNegotiations.find(n=>n.courseId===courseId)||null,alreadyProcessed:true};
    const sanctioned=Number(dto.sanctionedAmount ?? course.acceptedPrice ?? course.adminOffer ?? course.quotedPrice ?? 0);
    course.sanctionedAmount=sanctioned; course.providerPayoutStatus=sanctioned>0?'SANCTIONED':'NOT_APPLICABLE'; course.status='published'; course.reviewStatus='APPROVED'; course.approvedAt=new Date().toISOString();
    const n=this.db.courseNegotiations.find((x:any)=>x.courseId===courseId&&x.status==='OPEN'); if(n){n.status='CLOSED';n.finalAmount=sanctioned;n.messages.push({by:'PAYMENT_ADMIN',amount:sanctioned,message:'Course approved and officially published.',at:new Date().toISOString()});}
    if(sanctioned>0){this.db.transactions.push({id:this.db.id('txn'),type:'COURSE_PROVIDER_PAYOUT',customerType:'PROVIDER',customerId:course.providerId,courseId:course.id,amount:sanctioned,currency:'INR',status:'PAID',gateway:'INTERNAL_SETTLEMENT',platformRevenue:0,createdAt:new Date().toISOString()});}
    this.db.audit('COURSE_SANCTIONED_AND_PUBLISHED',actorId,{courseId,providerId:course.providerId,sanctionedAmount:sanctioned});
    return {course,negotiation:n||null};
  }
  negotiation(courseId:string,actorId?:string){ const actor=this.actor(actorId); const row=this.db.courseNegotiations.find((n:any)=>n.courseId===courseId)||null; if(!row)return null; if(actor?.role==='provider'&&row.providerId===actor.id)return row; this.requirePaymentAdmin(actorId); return row; }

  providerEarnings(providerId:string,actorId?:string){
    const actor=this.actor(actorId); if(actorId && !(actor?.role==='provider'&&actor.id===providerId)) this.requirePaymentAdmin(actorId);
    const provider=this.db.getUser(providerId); if(!provider||provider.role!=='provider') throw new NotFoundException('Provider not found.');
    const rows=this.db.transactions.filter((t:any)=>t.type==='COURSE_PROVIDER_PAYOUT'&&t.customerId===providerId&&t.status==='PAID');
    return {provider:this.db.safeUser(provider),totalEarned:rows.reduce((s:number,t:any)=>s+Number(t.amount||0),0),paidCourses:rows.length,transactions:rows,courses:this.db.courses.filter((c:any)=>c.providerId===providerId).map((c:any)=>({id:c.id,title:c.title,status:c.status,quotedPrice:c.quotedPrice||0,adminOffer:c.adminOffer||null,sanctionedAmount:c.sanctionedAmount||0,accessTier:c.accessTier||'FREE'}))};
  }
  instructorEarnings(instructorId:string,actorId?:string){
    const actor=this.actor(actorId); if(actorId && !(actor?.role==='instructor'&&actor.id===instructorId)) this.requirePaymentAdmin(actorId);
    const instructor=this.db.getUser(instructorId); if(!instructor||instructor.role!=='instructor') throw new NotFoundException('Instructor not found.');
    const students=this.db.users.filter((u:any)=>u.role==='learner'&&u.instructorId===instructorId&&u.status==='active');
    const rate=Number(instructor.instructorMonthlyRate||this.db.config.instructorRatePerStudent||500); const base=students.length*rate;
    const skillPoints=students.reduce((s:number,u:any)=>s+Number(u.skillPoints||0),0);
    const month=new Date().toISOString().slice(0,7);
    const performanceBonus=this.db.instructorPayouts.filter((p:any)=>p.instructorId===instructorId&&p.type==='PERFORMANCE_BONUS'&&String(p.paidAt||'').slice(0,7)===month).reduce((sum:number,p:any)=>sum+Number(p.amount||0),0);
    const monthlyPaid=this.db.instructorPayouts.filter((p:any)=>p.instructorId===instructorId&&p.type==='MONTHLY_STUDENT_PAYOUT'&&p.month===month&&p.status==='PAID').reduce((sum:number,p:any)=>sum+Number(p.amount||0),0);
    return {instructor:this.db.safeUser(instructor),activeStudents:students.length,perStudentMonthlyRate:rate,baseMonthlyEarning:base,studentSkillPoints:skillPoints,performanceBonus,totalMonthlyEarning:base+performanceBonus,currentMonth:month,basePaidThisMonth:monthlyPaid,payouts:this.db.instructorPayouts.filter((p:any)=>p.instructorId===instructorId).slice().reverse()};
  }
  payInstructorMonth(instructorId:string,dto:InstructorMonthlyPayoutDto,actorId?:string){
    this.requirePaymentAdmin(actorId);
    const instructor=this.db.getUser(instructorId); if(!instructor||instructor.role!=='instructor') throw new NotFoundException('Instructor not found.');
    const month=dto.month||new Date().toISOString().slice(0,7);
    if(this.db.instructorPayouts.some((p:any)=>p.instructorId===instructorId&&p.type==='MONTHLY_STUDENT_PAYOUT'&&p.month===month&&p.status==='PAID')) throw new ConflictException(`Monthly instructor payout for ${month} is already completed.`);
    const students=this.db.users.filter((u:any)=>u.role==='learner'&&u.instructorId===instructorId&&u.status==='active');
    const rate=Number(instructor.instructorMonthlyRate||this.db.config.instructorRatePerStudent||500); const amount=students.length*rate;
    const row={id:this.db.id('pay'),instructorId,month,studentCount:students.length,perStudentRate:rate,amount,type:'MONTHLY_STUDENT_PAYOUT',reason:`${students.length} active learners × ₹${rate} for ${month}`,status:'PAID',paidAt:new Date().toISOString()};
    this.db.instructorPayouts.push(row); this.db.transactions.push({id:this.db.id('txn'),type:'INSTRUCTOR_MONTHLY_PAYOUT',customerType:'INSTRUCTOR',customerId:instructorId,amount,currency:'INR',status:'PAID',gateway:'INTERNAL_SETTLEMENT',platformRevenue:0,createdAt:new Date().toISOString(),month}); this.db.audit('INSTRUCTOR_MONTHLY_SETTLEMENT_RECORDED',actorId,{instructorId,month,amount,studentCount:students.length,rate});
    this.db.notifications.push({id:this.db.id('n'),userId:instructorId,message:`Monthly instructor payment received: ₹${amount.toLocaleString('en-IN')} for ${month}.`,type:'success',read:false,createdAt:new Date().toISOString()});
    return {payout:row,earnings:this.instructorEarnings(instructorId)};
  }
  setInstructorRate(instructorId:string,dto:InstructorRateDto,actorId?:string){ this.requirePaymentAdmin(actorId); const i=this.db.getUser(instructorId); if(!i||i.role!=='instructor')throw new NotFoundException('Instructor not found.'); i.instructorMonthlyRate=Number(dto.perStudentMonthlyRate); this.db.audit('INSTRUCTOR_RATE_UPDATED',actorId,{instructorId,perStudentMonthlyRate:i.instructorMonthlyRate}); return this.instructorEarnings(instructorId); }
  addInstructorBonus(instructorId:string,dto:InstructorBonusDto,actorId?:string){
    this.requirePaymentAdmin(actorId); const i=this.db.getUser(instructorId); if(!i||i.role!=='instructor')throw new NotFoundException('Instructor not found.'); const row={id:this.db.id('pay'),instructorId,amount:Number(dto.amount),type:'PERFORMANCE_BONUS',reason:dto.reason||'Skill growth performance bonus',status:'PAID',paidAt:new Date().toISOString()}; this.db.instructorPayouts.push(row); this.db.transactions.push({id:this.db.id('txn'),type:'INSTRUCTOR_BONUS',customerType:'INSTRUCTOR',customerId:instructorId,amount:Number(dto.amount),currency:'INR',status:'PAID',gateway:'INTERNAL_SETTLEMENT',platformRevenue:0,createdAt:new Date().toISOString()}); this.db.audit('INSTRUCTOR_BONUS_RECORDED',actorId,{instructorId,amount:Number(dto.amount),reason:row.reason}); return this.instructorEarnings(instructorId);
  }

  revenueSummary(actorId?:string){
    this.requirePaymentAdmin(actorId);
    const paid=this.db.transactions.filter((t:any)=>t.status==='PAID');
    const pro=paid.filter((t:any)=>t.type==='PRO_SUBSCRIPTION').reduce((s:number,t:any)=>s+Number(t.platformRevenue||t.amount||0),0);
    const b2b=paid.filter((t:any)=>t.type==='B2B_INSTITUTION_LICENSE').reduce((s:number,t:any)=>s+Number(t.platformRevenue||t.amount||0),0);
    const learnerCount=this.db.users.filter((u:any)=>u.role==='learner').length; const studentCommission=learnerCount*Number(this.db.config.platformPerStudentCommission||50);
    return {currency:'INR',b2cProRevenue:pro,b2bInstitutionRevenue:b2b,perStudentCommission:studentCommission,totalPlatformRevenue:pro+b2b+studentCommission,providerPayouts:paid.filter((t:any)=>t.type==='COURSE_PROVIDER_PAYOUT').reduce((s:number,t:any)=>s+Number(t.amount||0),0),instructorPayouts:paid.filter((t:any)=>['INSTRUCTOR_BONUS','INSTRUCTOR_MONTHLY_PAYOUT'].includes(t.type)).reduce((s:number,t:any)=>s+Number(t.amount||0),0),transactions:paid.slice().reverse()};
  }
  adminTeam(){ return this.db.users.filter((u:any)=>u.role==='admin'||u.role==='superuser').map((u:any)=>this.db.safeUser(u)); }
}
