import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { config } from './config.js';
import { DAY,notify } from './db.js';
import { passwordHash } from './services/auth.js';
import { quotes } from './services/market.js';
import { installInstruments } from './services/instruments.js';
export { installInstruments } from './services/instruments.js';
import { account,order } from './services/trading.js';

export const demoPassword='IndAI-Demo-2026';
export async function seed(db) {
  if(!config.demo || config.production) throw Error('The fixture loader requires local demo mode.');
  installInstruments(db);
  if(db.get("SELECT 1 FROM users WHERE email='super@indai.test'")) return;
  const now=Date.now();
  const first=['Aditi','Ananya','Arjun','Dev','Diya','Ishaan','Kavya','Leela','Maya','Meera','Nikhil','Ravi','Riya','Tara','Vihaan'];
  const last=['Menon','Kapoor','Iyer','Das','Shah','Rao','Gill','Roy','Nair','Sethi','Pai','Jain','Bose','Singh','Sen','Raman','Patel','Ghosh','Mehta','Naidu'];
  const name=i=>first[i%first.length]+' '+last[Math.floor(i/first.length)%last.length];
  const credential=passwordHash(demoPassword);
  const add=(email,display,role,status='approved')=>db.run('INSERT INTO users(email,name,password,role,status) VALUES (?,?,?,?,?)',
    email,display,credential,role,status).lastInsertRowid;
  const rows=db.all("SELECT * FROM instruments WHERE symbol IN ('RELIANCE','TCS','INFY','HDFCBANK','SBIN','ITC','BHARTIARTL','AXISBANK') ORDER BY symbol");
  const ticks=config.provider==='demo'?await quotes(rows,now-DAY):rows.map(row=>({symbol:row.symbol,price:row.base,source:'demo',executable:true}));
  db.tx(()=>{
    add('users@indai.test','Demo Admin','admin');
    add('super@indai.test','Demo Super Admin','superadmin');
    const specialists={};
    for(const [role,count] of [['instructor',32],['provider',18]]) {
      specialists[role]=Array.from({length:count},(_,i)=>{
        const user=add(role+(i+1)+'@indai.test',name(i+(role==='instructor'?8:role==='provider'?50:90)),role);
        db.run('INSERT INTO staff VALUES (?,?,?,?)',user,8,
          (role==='instructor'?['Market basics','Risk and position sizing','Price action','Trading journals']:role==='provider'?['Learning plans and courses','Risk education','Practice milestones']:['Trading foundations','Technical analysis','Risk education'])[i%(role==='instructor'?4:3)],
          ['English, Hindi','English, Telugu','English, Tamil'][i%3]);
        if(role==='instructor') account(db,user,now-14*DAY);
        return user;
      });
    }
    const learners=Array.from({length:300},(_,i)=>{
      const status=i>=200 || i<3?'approved':i===3?'pending':i%23===0?'suspended':i%19===0?'rejected':i%13===0?'pending':'approved';
      const user=add('student'+(i+1)+'@indai.test',name(i),'student',status);
      const tier=i<200?'basic':i<260?'pro':'plus';
      db.run('INSERT INTO applications(student,state,note,created,decided) VALUES (?,?,?,?,?)',user,
        status==='suspended'?'approved':status,status==='rejected'?'Please update your learning application.':null,now-14*DAY,status==='pending'?null:now-13*DAY);
      if(tier!=='basic') db.run("INSERT INTO subscriptions(student,plan,starts,ends,state) VALUES (?,?,?,?,'active')",user,tier,now-10*DAY,now+365*DAY);
      if(status==='approved') {
        account(db,user,now-10*DAY);
        for(const [title,symbols] of [['NSE favourites',['RELIANCE','INFY','TCS']],['Practice ideas',['SBIN','ITC']]]) {
          const list=db.run('INSERT INTO watchlists(user_id,name) VALUES (?,?)',user,title).lastInsertRowid;
          symbols.forEach((symbol,index)=>db.run('INSERT INTO watchlist_items VALUES (?,?,?)',list,symbol,index));
        }
      }
      return {user,status,tier,index:i};
    });
    const sizes=[5,4,5,4,3,2,1,0,4,3,1];
    const instructorLearners=learners.filter(learner=>learner.tier==='plus');
    let cursor=0;
    const active=[];
    for(const [i,count] of sizes.entries()) {
      for(let j=0;j<count;j++) {
        const learner=instructorLearners[cursor++];
        const staff=specialists.instructor[i];
        const relationship=db.run("INSERT INTO guidance(student,staff,kind,state,goal,created,expires) VALUES (?,?,'instructor','active',?,?,?)",
          learner.user,staff,['Understand order execution','Build a risk budget','Improve my review routine'][j%3],now-(j+2)*DAY,now+365*DAY).lastInsertRowid;
        active.push({relationship,student:learner.user,staff});
        const assignment=db.run('INSERT INTO assignments(relationship,title,body,due) VALUES (?,?,?,?)',relationship,
          ['Review a paper order','Write a risk plan','Read a candlestick chart'][j%3],
          'Describe your decision, position size, and what you learned. Include an example from your paper portfolio.',now+(j-1)*DAY).lastInsertRowid;
        if(j%3!==2) {
          const reviewed=j%2===0;
          db.run('INSERT INTO submissions(assignment,body,created,feedback,reviewed) VALUES (?,?,?,?,?)',assignment,
            'I used a smaller position, recorded the quote source, and compared the fill with my estimate.',now-2*DAY,
            reviewed?'Good reflection. Explain how you calculated the amount at risk.':null,reviewed?now-DAY:null);
        }
        if(j===0) {
          const quiz=db.run("INSERT INTO quizzes(owner,assignment,title,description,state,due,created) VALUES (?,?,?,?,'published',?,?)",
            staff,assignment,'Order review check','Answer a choice question and explain your reasoning.',now+7*DAY,now-DAY).lastInsertRowid;
          db.run("INSERT INTO quiz_questions(quiz,position,kind,prompt,options,correct,points,required) VALUES (?,0,'mcq',?, ?,0,2,1)",
            quiz,'What does a limit buy constrain?',JSON.stringify(['Maximum purchase price','Guaranteed profit','Minimum share quantity']));
          db.run("INSERT INTO quiz_questions(quiz,position,kind,prompt,points,required) VALUES (?,1,'short','Name one source of execution uncertainty.',3,1)",quiz);
          db.run("INSERT INTO quiz_questions(quiz,position,kind,prompt,points,required) VALUES (?,2,'long','Explain how you would review a losing paper trade.',5,1)",quiz);
          if(i%3!==0) {
            const items=db.all('SELECT id,kind,points FROM quiz_questions WHERE quiz=? ORDER BY position',quiz);
            const graded=i%3===1;
            const attempt=db.run('INSERT INTO quiz_attempts(quiz,student,state,score,maximum,created,graded) VALUES (?,?,?,?,10,?,?)',
              quiz,learner.user,graded?'graded':'submitted',graded?8:2,now-DAY,graded?now:null).lastInsertRowid;
            items.forEach((q,index)=>db.run('INSERT INTO quiz_answers VALUES (?,?,?,?,?)',attempt,q.id,
              index===0?'0':index===1?'Price gaps can change the execution price.':'I compare the order instructions, risk budget, and actual fill before updating my practice plan.',
              index===0?2:graded?(index===1?3:3):null,graded&&index>0?'Clear reasoning. Include a numerical example next time.':null));
          }
        }
      }
    }
    for(const [i,learner] of instructorLearners.slice(cursor,-2).entries()) {
      db.run("INSERT INTO guidance(student,staff,kind,state,goal,created,expires) VALUES (?,?,'instructor',?,?,?,?)",
        learner.user,specialists.instructor[(i+5)%32],i%3===0?'pending':i%3===1?'declined':'expired','Develop a steady practice routine.',now-2*DAY,now+(i%3===2?-DAY:5*DAY));
    }
    const providerLearners=[...learners.slice(200,212),...learners.slice(260,292)];
    for(const [i,learner] of providerLearners.entries()) {
      const staff=specialists.provider[i%12];
      const relationship=db.run("INSERT INTO guidance(student,staff,kind,state,goal,created,expires) VALUES (?,?,'provider','active',?,?,?)",
        learner.user,staff,'Plan my next four weeks of learning.',now-3*DAY,now+365*DAY).lastInsertRowid;
      db.run('INSERT INTO learning_plans VALUES (?,?,?,?)',relationship,'Four-week practice plan','Start with market orders, then add a risk budget and a weekly journal review.',now-DAY);
      db.run('INSERT INTO milestones(relationship,title,body,due,state) VALUES (?,?,?,?,?)',relationship,'Finish introductory lessons','Complete the first module and write a reflection.',now+(i%5)*DAY,['planned','in-progress','complete'][i%3]);
    }
    const catalog=[
      ['Paper Trading Foundations','basic','Market and limit orders, simulated fills, and how to read your portfolio.'],
      ['Reading Candlestick Charts','basic','Identify open, close, high and low on a candle.'],
      ['Position Sizing and Trade Risk','pro','Use a defined risk budget to choose position size.'],
      ['Building a Trading Journal','pro','Build a repeatable review routine and record your decisions.'],
      ['Planning a Practice Portfolio','plus','Define learning milestones for a four-week practice period.'],
      ['Working with Limit and Stop Orders','pro','Compare price conditions and execution risks.'],
      ['Reviewing a Losing Trade','basic','Write a constructive review that focuses on process.'],
      ['Understanding Trading Costs','basic','Explore how costs change reported trading performance.']
    ];
    const assets=[
      ['The Complete Guide to Trading.pdf','application/pdf','trading-guide.pdf'],
      ['TradingView paper trading tutorial.mp4','video/mp4','paper-trading-tutorial.mp4']
    ].map(([filename,mime,path])=>{
      const bytes=readFileSync(new URL('./assets/'+path,import.meta.url));
      return db.run('INSERT INTO resources(owner,name,mime,size,bytes,created) VALUES (?,?,?,?,?,?)',
        specialists.provider[0],filename,mime,bytes.length,bytes,now-10*DAY).lastInsertRowid;
    });
    catalog.forEach(([title,policy,description],i)=>{
      const owner=i<2?specialists.instructor[i]:specialists.provider[(i-2)%6];
      const course=db.run('INSERT INTO courses(owner,title,description,outcomes,difficulty,prerequisites,policy,state) VALUES (?,?,?,?,?,?,?,?)',
        owner,title,description,description,i<2?'introductory':'intermediate',i<2?'None':'Paper Trading Foundations',policy,i===7?'review':'published').lastInsertRowid;
      if(i>=2) db.run('INSERT INTO course_terms VALUES (?,?,?,?,?,?)',course,200000+i*25000,200000+i*25000,i===7?'submitted':'agreed','Demo course licensing agreement.',now-DAY);
      for(const resource of assets) db.run("INSERT INTO resource_links(resource,kind,target) VALUES (?,'course',?)",resource,course);
      const lessonIds=[];
      for(const [position,heading,body] of [[1,'Core concept',description],[2,'Practice exercise','Pick an NSE instrument. Record the source, order instructions, estimated cost, and fill status.'],[3,'Review and reflection','Compare your expectations with the order history and identify one improvement.']]) {
        const lesson=db.run('INSERT INTO lessons(course,module,title,body,position) VALUES (?,?,?,?,?)',course,'Module 1',heading,
          body+'\n\nThe supplied video demonstrates an external platform, including short selling. IndAI currently supports long-only equity practice.',position).lastInsertRowid;
        lessonIds.push(lesson);
      }
      const selected=learners.filter(l=>l.status==='approved' && ({basic:0,pro:1,plus:2}[l.tier]>={basic:0,pro:1,plus:2}[policy])).slice(i*3,i*3+16);
      selected.forEach((learner,j)=>{
        db.run('INSERT INTO enrollments VALUES (?,?,?)',learner.user,course,now-(j%7+1)*DAY);
        for(const lesson of lessonIds.slice(0,j%4)) db.run('INSERT INTO progress VALUES (?,?,?)',learner.user,lesson,now-DAY);
      });
      if(i===0) {
        const quiz=db.run("INSERT INTO quizzes(owner,course,title,description,state,created) VALUES (?,?,?,?,'published',?)",owner,course,
          'Foundations knowledge check','Check your understanding after the introductory lessons.',now-DAY).lastInsertRowid;
        db.run("INSERT INTO quiz_questions(quiz,position,kind,prompt,options,correct,points,required) VALUES (?,0,'mcq',?,?,0,2,1)",
          quiz,'What does a paper trading balance represent?',JSON.stringify(['Simulated funds for practice','A withdrawable bank deposit','A guarantee of returns']));
        db.run("INSERT INTO quiz_questions(quiz,position,kind,prompt,points,required) VALUES (?,1,'short','What would you record in your trading journal?',3,1)",quiz);
      }
      if(i>=2&&i<5) db.run('INSERT INTO provider_settlements(course,provider,amount,state,reference,created,paid) VALUES (?,?,?,?,?,?,?)',
        course,owner,200000+i*25000,i===2?'paid':'earned',i===2?'DEMO-SETTLEMENT-001':null,now-DAY,i===2?now:null);
    });
    notify(db,learners[0].user,'Your Free workspace is ready.','/trading');
    notify(db,learners[200].user,'Your Pro workspace and course provider guidance are ready.','/guidance');
    const ticket=db.run('INSERT INTO tickets(user_id,subject,created) VALUES (?,?,?)',learners[0].user,'Understanding the simulated order fee',now-DAY).lastInsertRowid;
    db.run('INSERT INTO replies(ticket,author,body,created) VALUES (?,?,?,?)',ticket,learners[0].user,'Where can I see the paper order fee after a fill?',now-DAY);
  });
    const histories=db.all("SELECT id user FROM users WHERE role='student' AND status='approved' ORDER BY id LIMIT 40")
    .concat(db.all("SELECT id user FROM users WHERE role='instructor' AND status='approved' ORDER BY id LIMIT 12"));
  for(const [i,person] of histories.entries()) {
      const tick=ticks[i%ticks.length];
      order(db,person.user,{symbol:tick.symbol,clientKey:randomUUID(),side:'buy',type:'market',qty:4,validity:'DAY'},tick,'demo',now-DAY);
      order(db,person.user,{symbol:tick.symbol,clientKey:randomUUID(),side:'sell',type:'market',qty:1,validity:'DAY'},tick,'demo',now-DAY+3600000);
    }
}
export function bootstrap(db) {
  if(config.demo) return;
  if(config.production && db.get("SELECT 1 FROM users WHERE email='super@indai.test' AND role='superadmin'")) throw Error('Set DATA_DIR to a separate production database directory.');
  const {email,password,mfa}=config.admin;
  if(!email && !password && !mfa) return;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||'') || !password || password.length<16 || !/^[A-Z2-7]{16,128}$/i.test(mfa||'')) throw Error('Configure a valid bootstrap email, 16+ character password and base32 TOTP secret.');
  const address=email.trim().toLowerCase();
  const existing=db.get('SELECT role FROM users WHERE email=?',address);
  if(existing?.role==='superadmin') return;
  if(existing) throw Error('Bootstrap email belongs to an existing account.');
  db.run("INSERT INTO users(email,name,password,role,status) VALUES (?,'Platform Administrator',?,'superadmin','approved')",address,passwordHash(password));
}
