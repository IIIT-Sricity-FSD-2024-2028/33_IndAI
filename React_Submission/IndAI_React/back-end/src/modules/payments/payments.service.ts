import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import * as https from 'https';
import { DataStore } from '../../store/data.store';
import { CreateB2BRazorpayOrderDto, CreateProRazorpayOrderDto, VerifyB2BRazorpayPaymentDto, VerifyProRazorpayPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly db:DataStore){}

  private keyId(){ return String(process.env.RAZORPAY_KEY_ID || '').trim(); }
  private keySecret(){ return String(process.env.RAZORPAY_KEY_SECRET || '').trim(); }
  private webhookSecret(){ return String(process.env.RAZORPAY_WEBHOOK_SECRET || '').trim(); }
  private configured(){ const id=this.keyId(), secret=this.keySecret(); return /^rzp_(test|live)_[A-Za-z0-9]+$/.test(id) && secret.length>=8 && !/replace_me/i.test(secret); }

  private paymentLink(){
    const value=String(process.env.RAZORPAY_PAYMENT_LINK||'').trim();
    try{const url=new URL(value);return url.protocol==='https:'&&['razorpay.me','rzp.io','pages.razorpay.com'].includes(url.hostname)?url.href:null;}catch{return null;}
  }
  config(){
    const keyId=this.keyId();
    return {
      configured:this.configured(),
      paymentLink:this.paymentLink(),
      keyId: keyId || null,
      mode:keyId.startsWith('rzp_live_')?'LIVE':keyId.startsWith('rzp_test_')?'TEST':'UNCONFIGURED',
      currency:'INR',
      merchantName:'IndAI',
      checkoutScript:'https://checkout.razorpay.com/v1/checkout.js',
    };
  }

  private requireConfigured(){
    if(!this.configured()) throw new ServiceUnavailableException('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to back-end/.env and restart the backend.');
  }

  private requireAuthenticatedLearner(userId?:string){
    const u=userId?this.db.getUser(userId):null;
    if(!u || u.role!=='learner' || u.status!=='active') throw new ForbiddenException('An authenticated active learner JWT is required for Pro checkout.');
    return u;
  }

  private requirePaymentAdmin(userId?:string){
    const u=userId?this.db.getUser(userId):null;
    if(!u || !((u.role==='admin'&&u.adminTeam==='PAYMENT_ADMIN')||u.role==='superuser')) throw new ForbiddenException('Payment Admin or Super Admin access required.');
    return u;
  }

  private razorpayPost(path:string, body:any):Promise<any>{
    this.requireConfigured();
    const data=JSON.stringify(body);
    const auth=Buffer.from(`${this.keyId()}:${this.keySecret()}`).toString('base64');
    return new Promise((resolve,reject)=>{
      const req=https.request({hostname:'api.razorpay.com',port:443,path,method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},res=>{
        let raw=''; res.on('data',d=>raw+=d); res.on('end',()=>{
          let parsed:any={}; try{parsed=raw?JSON.parse(raw):{};}catch{parsed={raw};}
          if((res.statusCode||500)>=200 && (res.statusCode||500)<300) return resolve(parsed);
          reject(new BadRequestException(parsed?.error?.description || parsed?.error?.reason || `Razorpay request failed (${res.statusCode}).`));
        });
      });
      req.setTimeout(12000,()=>req.destroy(new Error('Razorpay request timed out. Please retry.')));
      req.on('error',err=>reject(new ServiceUnavailableException(`Unable to contact Razorpay: ${err.message}`)));
      req.write(data); req.end();
    });
  }

  private async requireCaptured(intent:any,paymentId:string){
    this.requireConfigured();
    let response:any;try{response=await fetch('https://api.razorpay.com/v1/payments/'+encodeURIComponent(paymentId),{headers:{Authorization:'Basic '+Buffer.from(this.keyId()+':'+this.keySecret()).toString('base64')},signal:AbortSignal.timeout(12000)});}catch{throw new ServiceUnavailableException('Payment status could not be confirmed. Retry verification; the signed captured webhook can also finalize it.');}
    const payment:any=await response.json();
    if(!response.ok||payment.status!=='captured'||payment.order_id!==intent.orderId||payment.currency!=='INR'||Number(payment.amount)!==Math.round(Number(intent.amount)*100))throw new BadRequestException('Payment is not captured for the matching order and amount. Access will activate only after capture.');
  }
  private verifyCheckoutSignature(orderId:string,paymentId:string,signature:string){
    this.requireConfigured();
    const expected=createHmac('sha256',this.keySecret()).update(`${orderId}|${paymentId}`).digest('hex');
    const a=Buffer.from(expected); const b=Buffer.from(String(signature||''));
    if(a.length!==b.length || !timingSafeEqual(a,b)) throw new BadRequestException('Razorpay payment signature verification failed. Pro/B2B access was not activated.');
  }

  async createProOrder(dto:CreateProRazorpayOrderDto,actorId?:string){
    const user=this.requireAuthenticatedLearner(actorId);
    if(dto.userId!==user.id) throw new ForbiddenException('JWT learner identity does not match the requested subscription user.');
    const plan=this.db.subscriptionPlans.find((p:any)=>p.id===dto.planId&&p.audience==='B2C'&&p.code==='PRO'); if(!plan) throw new NotFoundException('Pro subscription plan not found.');
    const amount=Math.round(Number(plan.price)*100); if(amount<100) throw new BadRequestException('Invalid subscription amount.');
    const receipt=`pro_${user.id}_${Date.now()}`.slice(0,40);
    const order=await this.razorpayPost('/v1/orders',{amount,currency:'INR',receipt,notes:{purpose:'PRO_SUBSCRIPTION',userId:user.id,planId:plan.id}});
    const intent={id:this.db.id('rpi'),provider:'RAZORPAY',purpose:'PRO_SUBSCRIPTION',subjectId:user.id,planId:plan.id,amount:Number(plan.price),amountSubunits:amount,currency:'INR',orderId:order.id,status:'CREATED',createdAt:new Date().toISOString()};
    this.db.paymentIntents.push(intent);
    this.db.audit('PAYMENT_ORDER_CREATED',user.id,{purpose:intent.purpose,orderId:order.id,amount:intent.amount,planId:plan.id});
    return {orderId:order.id,amount:order.amount,currency:order.currency,keyId:this.keyId(),name:'IndAI',description:`${plan.name} subscription`,plan:{id:plan.id,name:plan.name,price:plan.price,billing:plan.billing},prefill:{name:`${user.firstName} ${user.lastName}`,email:user.email,contact:user.phone||''}};
  }

  async verifyProPayment(dto:VerifyProRazorpayPaymentDto,actorId?:string){
    const user=this.requireAuthenticatedLearner(actorId);
    if(dto.userId!==user.id) throw new ForbiddenException('JWT learner identity does not match the payment verification user.');
    const intent=this.db.paymentIntents.find((i:any)=>i.orderId===dto.razorpay_order_id&&i.purpose==='PRO_SUBSCRIPTION'&&i.subjectId===dto.userId&&i.planId===dto.planId);
    if(!intent) throw new NotFoundException('Razorpay subscription order was not found or does not match this learner/plan.');
    if(intent.status==='PAID') { const tx=this.db.transactions.find((t:any)=>t.razorpayOrderId===intent.orderId); const sub=this.db.subscriptions.find((x:any)=>x.razorpayOrderId===intent.orderId); return {subscription:sub||null,transaction:tx||null,receipt:intent.paymentId?`RZP-${intent.paymentId}`:null,tier:'PRO',alreadyProcessed:true}; }
    this.verifyCheckoutSignature(intent.orderId,dto.razorpay_payment_id,dto.razorpay_signature);
    await this.requireCaptured(intent,dto.razorpay_payment_id);
    return this.finalizeProIntent(intent,dto.razorpay_payment_id);
  }

  private finalizeProIntent(intent:any,paymentId:string){
    const existing=this.db.transactions.find((t:any)=>t.razorpayPaymentId===paymentId || t.razorpayOrderId===intent.orderId);
    if(existing && existing.status==='PAID') { const sub=this.db.subscriptions.find((x:any)=>x.razorpayOrderId===intent.orderId); return {subscription:sub||null,transaction:existing,receipt:existing.razorpayPaymentId?`RZP-${existing.razorpayPaymentId}`:null,tier:'PRO',alreadyProcessed:true}; }
    const user=this.db.getUser(intent.subjectId); if(!user||user.role!=='learner') throw new NotFoundException('Learner not found.');
    const plan=this.db.subscriptionPlans.find((p:any)=>p.id===intent.planId&&p.code==='PRO'); if(!plan) throw new NotFoundException('Pro plan not found.');
    this.db.subscriptions.filter((s:any)=>s.customerType==='USER'&&s.customerId===user.id&&s.status==='ACTIVE').forEach((s:any)=>s.status='SUPERSEDED');
    const now=new Date(); const days=Number(plan.days||30);
    const sub={id:this.db.id('sub'),customerType:'USER',customerId:user.id,planId:plan.id,status:'ACTIVE',amount:Number(plan.price),startedAt:now.toISOString(),renewsAt:new Date(now.getTime()+days*86400000).toISOString(),gateway:'RAZORPAY',razorpayOrderId:intent.orderId,razorpayPaymentId:paymentId};
    const tx:any={id:this.db.id('txn'),type:'PRO_SUBSCRIPTION',customerType:'USER',customerId:user.id,amount:Number(plan.price),currency:'INR',status:'PAID',gateway:'RAZORPAY',platformRevenue:Number(plan.price),razorpayOrderId:intent.orderId,razorpayPaymentId:paymentId,createdAt:now.toISOString()};
    const result={subscription:sub,transaction:tx,receipt:`RZP-${paymentId}`,tier:'PRO'};
    this.db.subscriptions.push(sub); this.db.transactions.push(tx); user.subscriptionTier='PRO'; intent.status='PAID'; intent.paymentId=paymentId; intent.paidAt=now.toISOString();
    this.db.notifications.push({id:this.db.id('n'),userId:user.id,message:`IndAI Pro activated through Razorpay (${plan.name}).`,type:'success',read:false,createdAt:now.toISOString()});
    this.db.audit('RAZORPAY_PAYMENT_VERIFIED',user.id,{purpose:'PRO_SUBSCRIPTION',orderId:intent.orderId,paymentId,amount:plan.price});
    return result;
  }

  async createB2BOrder(orgId:string,dto:CreateB2BRazorpayOrderDto,actorId?:string){
    this.requirePaymentAdmin(actorId);
    const org=this.db.organizations.find((o:any)=>o.id===orgId); if(!org) throw new NotFoundException('Institution not found.');
    const amountRupees=Number(dto.amount||org.annualPrice||0); if(amountRupees<=0) throw new BadRequestException('Institution license amount must be greater than zero.');
    org.annualPrice=amountRupees;
    const amount=Math.round(amountRupees*100); const receipt=`b2b_${org.id}_${Date.now()}`.slice(0,40);
    const order=await this.razorpayPost('/v1/orders',{amount,currency:'INR',receipt,notes:{purpose:'B2B_INSTITUTION_LICENSE',organizationId:org.id,organizationName:org.name}});
    const intent={id:this.db.id('rpi'),provider:'RAZORPAY',purpose:'B2B_INSTITUTION_LICENSE',subjectId:org.id,amount:amountRupees,amountSubunits:amount,currency:'INR',orderId:order.id,status:'CREATED',createdBy:actorId,createdAt:new Date().toISOString()};
    this.db.paymentIntents.push(intent); this.db.audit('PAYMENT_ORDER_CREATED',actorId,{purpose:intent.purpose,organizationId:org.id,orderId:order.id,amount:amountRupees});
    return {orderId:order.id,amount:order.amount,currency:order.currency,keyId:this.keyId(),name:'IndAI',description:`${org.name} annual institution license`,organization:{id:org.id,name:org.name,billingEmail:org.billingEmail},prefill:{name:org.name,email:org.billingEmail||''}};
  }

  async verifyB2BPayment(orgId:string,dto:VerifyB2BRazorpayPaymentDto,actorId?:string){
    this.requirePaymentAdmin(actorId);
    const intent=this.db.paymentIntents.find((i:any)=>i.orderId===dto.razorpay_order_id&&i.purpose==='B2B_INSTITUTION_LICENSE'&&i.subjectId===orgId);
    if(!intent) throw new NotFoundException('Razorpay institution order was not found or does not match this institution.');
    if(Math.abs(Number(intent.amount)-Number(dto.amount))>0.001) throw new BadRequestException('Institution payment amount does not match the Razorpay order.');
    if(intent.status==='PAID') { const tx=this.db.transactions.find((t:any)=>t.razorpayOrderId===intent.orderId); const org=this.db.organizations.find((o:any)=>o.id===orgId); return {organization:org||null,transaction:tx||null,receipt:intent.paymentId?`RZP-B2B-${intent.paymentId}`:null,alreadyProcessed:true}; }
    this.verifyCheckoutSignature(intent.orderId,dto.razorpay_payment_id,dto.razorpay_signature);
    await this.requireCaptured(intent,dto.razorpay_payment_id);
    return this.finalizeB2BIntent(intent,dto.razorpay_payment_id,actorId);
  }

  private finalizeB2BIntent(intent:any,paymentId:string,actorId?:string){
    const existing=this.db.transactions.find((t:any)=>t.razorpayPaymentId===paymentId || t.razorpayOrderId===intent.orderId);
    if(existing && existing.status==='PAID') { const org=this.db.organizations.find((o:any)=>o.id===intent.subjectId); return {organization:org||null,transaction:existing,receipt:existing.razorpayPaymentId?`RZP-B2B-${existing.razorpayPaymentId}`:null,alreadyProcessed:true}; }
    const org=this.db.organizations.find((o:any)=>o.id===intent.subjectId); if(!org) throw new NotFoundException('Institution not found.');
    const now=new Date();
    const currentEnd=org.licenseEndsAt?new Date(org.licenseEndsAt):null;
    const base=currentEnd && Number.isFinite(currentEnd.getTime()) && currentEnd>now ? new Date(currentEnd) : new Date(now);
    const end=new Date(base); end.setFullYear(end.getFullYear()+1);
    org.annualPrice=Number(intent.amount); org.status='active'; org.licenseStatus='ACTIVE'; org.licenseStartedAt=org.licenseStartedAt||now.toISOString(); org.licenseEndsAt=end.toISOString(); org.activatedAt=now.toISOString();
    const tx:any={id:this.db.id('txn'),type:'B2B_INSTITUTION_LICENSE',customerType:'ORGANIZATION',customerId:org.id,amount:Number(intent.amount),currency:'INR',status:'PAID',gateway:'RAZORPAY',platformRevenue:Number(intent.amount),razorpayOrderId:intent.orderId,razorpayPaymentId:paymentId,createdAt:now.toISOString()};
    const result={organization:org,transaction:tx,receipt:`RZP-B2B-${paymentId}`};
    this.db.transactions.push(tx); intent.status='PAID'; intent.paymentId=paymentId; intent.paidAt=now.toISOString();
    this.db.audit('RAZORPAY_PAYMENT_VERIFIED',actorId,{purpose:'B2B_INSTITUTION_LICENSE',organizationId:org.id,orderId:intent.orderId,paymentId,amount:intent.amount});
    return result;
  }

  handleWebhook(rawBody:Buffer|undefined,signature:string|undefined){
    const secret=this.webhookSecret(); if(!secret) throw new ServiceUnavailableException('RAZORPAY_WEBHOOK_SECRET is not configured.');
    if(!rawBody || !signature) throw new BadRequestException('Missing Razorpay webhook body/signature.');
    const expected=createHmac('sha256',secret).update(rawBody).digest('hex');
    const a=Buffer.from(expected); const b=Buffer.from(signature);
    if(a.length!==b.length || !timingSafeEqual(a,b)) throw new BadRequestException('Invalid Razorpay webhook signature.');
    let event:any; try{event=JSON.parse(rawBody.toString('utf8'));}catch{throw new BadRequestException('Invalid webhook JSON.');}
    const payment=event?.payload?.payment?.entity; const orderId=payment?.order_id || event?.payload?.order?.entity?.id;
    const paymentId=payment?.id;
    const intent=this.db.paymentIntents.find((i:any)=>i.orderId===orderId);
    if(intent && intent.status!=='PAID' && paymentId && ['payment.captured','order.paid'].includes(event?.event)){
      if(Number(payment.amount)!==Math.round(Number(intent.amount)*100)||payment.currency!=='INR'||payment.status!=='captured')throw new BadRequestException('Webhook payment amount, currency or capture state mismatch.');
      if(intent.purpose==='PRO_SUBSCRIPTION') this.finalizeProIntent(intent,paymentId);
      else if(intent.purpose==='B2B_INSTITUTION_LICENSE') this.finalizeB2BIntent(intent,paymentId,intent.createdBy);
    }
    return {received:true,event:event?.event||'unknown',matchedOrder:Boolean(intent),alreadyProcessed:intent?.status==='PAID'};
  }
}
