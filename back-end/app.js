import express from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config, root } from './config.js';
import { ensure,log } from './db.js';
import { cookie, hash } from './services/auth.js';
import { authRoutes } from './routes/auth.js';
import { learningRoutes } from './routes/learning.js';
import { operationsRoutes } from './routes/operations.js';
import { guidanceRoutes } from './routes/guidance.js';
import { paymentWebhook, paymentRoutes } from './routes/payments.js';
import { tradingRoutes } from './routes/trading.js';
import { memberRoutes } from './routes/members.js';
import { quizRoutes } from './routes/quizzes.js';
import { resourceRoutes } from './routes/resources.js';
import { providerRoutes } from './routes/provider.js';
export function createApp(db,{ serve=false, ready=()=>true }={}) {
  const app = express();
  app.disable('x-powered-by');
  if (config.production) app.set('trust proxy', 1);
  app.use((req,res,next) => {
    req.rid = randomUUID();
    res.set({ 'X-Request-ID':req.rid, 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin',
      'X-Frame-Options':'DENY', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()' });
    if (req.path.startsWith('/api/')) res.set('Cache-Control','no-store');
    if (serve) res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.razorpay.com; connect-src 'self' https://*.razorpay.com; frame-src 'self' https://*.razorpay.com; media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    next();
  });
  app.use('/api',(req,res,next)=>{
    const initialToken=cookie(req);
    const initialActor=initialToken?db.get('SELECT user_id FROM sessions WHERE token=? AND expires>?',hash(initialToken),Date.now())?.user_id:null;
    const send=res.json.bind(res);
    res.json=body=>{
      if(!res.locals.requestAudited && !['GET','HEAD','OPTIONS'].includes(req.method) && res.statusCode<400) {
        const actor=req.user?.id || (req.path.startsWith('/auth/') && typeof req.body?.email==='string'
          ? db.get('SELECT id FROM users WHERE email=?',req.body.email.trim().toLowerCase())?.id : initialActor);
        log(db,actor || null,'request.'+req.method.toLowerCase(),req.originalUrl.split('?')[0],{requestId:req.rid,status:res.statusCode});
      }
      return send(body);
    };
    next();
  });
  paymentWebhook(app,db);
  app.use('/api',(req,res,next) => {
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      const allowed = [config.publicUrl];
      if (!config.production) allowed.push('http://localhost:' + config.port);
      ensure((!origin || allowed.includes(origin)) && req.get('sec-fetch-site') !== 'cross-site',403,'INVALID_ORIGIN','Open IndAI on its configured address.');
      ensure(req.get('x-indai-request') === '1',403,'CSRF_REQUIRED','A first-party request header is required.');
    }
    next();
  });
  app.use('/api',express.json({limit:'64kb'}));
  const auth = (req,res,next) => {
    const token = cookie(req);
    req.user = token && db.get('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?',hash(token),Date.now());
    ensure(req.user,401,'AUTH_REQUIRED','Sign in to continue.');
    next();
  };
  app.get('/api/health',(req,res) => res.json({status:'ok'}));
  app.get('/api/ready',(req,res) => {
    const ok = db.get('SELECT 1') && ready();
    res.status(ok ? 200 : 503).json({ status:ok ? 'ready' : 'degraded',worker:ok ? 'ok':'stale',market:config.provider,demo:config.demo });
  });
  app.get('/api/config',(req,res) => res.json({ demo:config.demo, market:config.provider }));
  authRoutes(app,db,auth);
  operationsRoutes(app,db,auth);
  guidanceRoutes(app,db,auth);
  learningRoutes(app,db,auth);
  paymentRoutes(app,db,auth);
  tradingRoutes(app,db,auth);
  memberRoutes(app,db,auth);
  quizRoutes(app,db,auth);
  resourceRoutes(app,db,auth);
  providerRoutes(app,db,auth);
  app.use('/api',(req,res) => ensure(false,404,'NOT_FOUND','API route not found.'));
  if (serve) {
    const dist = join(root,'frontend','dist');
    const index = join(dist,'index.html');
    if (!existsSync(index)) throw Error('Frontend build is missing. Run npm run build from the IndAI project root.');
    app.use(express.static(dist,{index:false}));
    app.get('/{*path}',(req,res,next) => {
      if (!req.accepts('html') || /\.[a-z\d]+$/i.test(req.path)) return next();
      res.sendFile(index);
    });
  }
  app.use((error,req,res,next) => {
    if (res.headersSent) return next(error);
    const status = error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status >= 500) console.error(JSON.stringify({ level:'error',requestId:req.rid,method:req.method,code:error.code || 'INTERNAL_ERROR',...(config.production ? {} : { message:error.message }) }));
    res.status(status).json({ code:error.code || (status === 400 ? 'INVALID_BODY' : 'INTERNAL_ERROR'),
      message:error.code && error.status ? error.message : status === 400 ? 'The request body is invalid.' : status === 413 ? 'The request body is too large.' : 'The server could not complete this request.', fields:error.fields, requestId:req.rid });
  });
  return app;
}
