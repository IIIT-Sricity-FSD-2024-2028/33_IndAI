// ============================================================
// IndAI Platform – Mock Data Store
// DATA_VERSION: bump whenever schema changes to reset localStorage
// ============================================================

const DATA_VERSION = "8";

// ---- Utility Globals ----
function genId(prefix) {
  return (prefix || "") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function todayISO() { return new Date().toISOString().split("T")[0]; }

// ---- Shared Formatting Helpers (available globally) ----
function fmtINR(val) { return "₹" + Number(val).toLocaleString("en-IN"); }
function fmtPct(val) { return (Number(val) >= 0 ? "+" : "") + Number(val).toFixed(2) + "%"; }
function gainLossClass(val) { return Number(val) >= 0 ? "gain" : "loss"; }

function emptyState(icon, msg, subMsg) {
  return `<div class="empty-state"><div class="icon">${icon}</div>
    <p style="font-weight:600;color:var(--gray-700);">${msg}</p>
    ${subMsg ? `<p style="font-size:12px;margin-top:4px;">${subMsg}</p>` : ""}</div>`;
}
function getRoleChip(role) {
  const m = { superuser:["chip-superuser","Super Admin"], admin:["chip-admin","Admin"], instructor:["chip-instructor","Instructor"], provider:["chip-provider","Course Provider"], learner:["chip-learner","Learner"] };
  const [cls, label] = m[role] || ["badge-gray", role];
  return `<span class="role-chip ${cls}">${label}</span>`;
}
function getDiffBadge(d) {
  const m = { Easy:"badge-green", Medium:"badge-orange", Hard:"badge-red" };
  return `<span class="badge ${m[d]||"badge-gray"}">${d}</span>`;
}
function getStatusBadge(s) {
  const m = { active:"badge-green", published:"badge-green", pending:"badge-orange", draft:"badge-gray", completed:"badge-blue", scheduled:"badge-blue", suspended:"badge-red", inactive:"badge-gray" };
  return `<span class="badge ${m[s]||"badge-gray"}">${s}</span>`;
}

// ---- Default seed data ----
function getDefaultData() {
  return {
    users: [
      { id:"u1", firstName:"Super", lastName:"Admin", email:"superadmin@indai.com", password:"Admin@1234", role:"superuser", status:"active", skillPoints:0, portfolioValue:0, tradingLimit:0, virtualBalance:0, createdAt:"2024-01-01" },
      { id:"u2", firstName:"Priya", lastName:"Sharma", email:"admin@indai.com", password:"Admin@1234", role:"admin", status:"active", skillPoints:0, portfolioValue:0, tradingLimit:0, virtualBalance:0, createdAt:"2024-01-05" },
      { id:"u3", firstName:"Dr. Amit", lastName:"Singh", email:"instructor@indai.com", password:"Inst@1234", role:"instructor", status:"active", skillPoints:0, portfolioValue:100000, tradingLimit:150000, virtualBalance:100000, studentIds:["u6","u7","u8","u10","u11","u12"], createdAt:"2024-01-10" },
      { id:"u4", firstName:"Prof. Sneha", lastName:"Reddy", email:"instructor2@indai.com", password:"Inst@1234", role:"instructor", status:"active", skillPoints:0, portfolioValue:100000, tradingLimit:150000, virtualBalance:100000, studentIds:["u9","u13"], createdAt:"2024-01-12" },
      { id:"u5", firstName:"TradingPro", lastName:"Academy", email:"provider@indai.com", password:"Prov@1234", role:"provider", status:"active", skillPoints:0, portfolioValue:0, tradingLimit:0, virtualBalance:0, createdAt:"2024-01-15" },
      { id:"u6", firstName:"Rahul", lastName:"Sharma", email:"learner@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:245, portfolioValue:108500, tradingLimit:150000, virtualBalance:44150, instructorId:"u3", studentId:"STU001", institution:"IIIT Sri City", grade:"3rd Year", major:"Computer Science", experience:"intermediate", riskTolerance:"moderate", createdAt:"2024-01-20" },
      { id:"u7", firstName:"Priya", lastName:"Patel", email:"learner2@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:180, portfolioValue:102300, tradingLimit:120000, virtualBalance:17700, instructorId:"u3", studentId:"STU002", institution:"IIIT Sri City", grade:"2nd Year", major:"ECE", experience:"beginner", riskTolerance:"low", createdAt:"2024-01-22" },
      { id:"u8", firstName:"Amit", lastName:"Kumar", email:"learner3@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:220, portfolioValue:106700, tradingLimit:140000, virtualBalance:33300, instructorId:"u3", studentId:"STU003", institution:"IIIT Sri City", grade:"3rd Year", major:"Computer Science", experience:"intermediate", riskTolerance:"high", createdAt:"2024-01-25" },
      { id:"u9", firstName:"Vikram", lastName:"Singh", email:"learner4@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:195, portfolioValue:104200, tradingLimit:130000, virtualBalance:25800, instructorId:"u4", studentId:"STU004", institution:"IIIT Sri City", grade:"4th Year", major:"MBA", experience:"intermediate", riskTolerance:"moderate", createdAt:"2024-02-01" },
      { id:"u10", firstName:"Sneha", lastName:"Reddy", email:"learner5@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:165, portfolioValue:99200, tradingLimit:110000, virtualBalance:10800, instructorId:"u3", studentId:"STU005", institution:"IIIT Sri City", grade:"2nd Year", major:"Finance", experience:"beginner", riskTolerance:"low", createdAt:"2024-02-05" },
      { id:"u11", firstName:"Ananya", lastName:"Iyer", email:"learner6@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:130, portfolioValue:103500, tradingLimit:120000, virtualBalance:22000, instructorId:"u3", studentId:"STU006", institution:"IIIT Sri City", grade:"1st Year", major:"Computer Science", experience:"beginner", riskTolerance:"low", createdAt:"2024-03-01" },
      { id:"u12", firstName:"Karan", lastName:"Mehta", email:"learner7@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:210, portfolioValue:111200, tradingLimit:145000, virtualBalance:38400, instructorId:"u3", studentId:"STU007", institution:"IIIT Sri City", grade:"3rd Year", major:"Finance", experience:"intermediate", riskTolerance:"high", createdAt:"2024-03-10" },
      { id:"u13", firstName:"Divya", lastName:"Nair", email:"learner8@indai.com", password:"Learn@1234", role:"learner", status:"active", skillPoints:155, portfolioValue:97800, tradingLimit:115000, virtualBalance:14200, instructorId:"u4", studentId:"STU008", institution:"IIIT Sri City", grade:"2nd Year", major:"Economics", experience:"beginner", riskTolerance:"low", createdAt:"2024-03-15" }
    ],

    courses: [
      { id:"c1", title:"Introduction to Stock Markets", description:"Learn fundamentals of equity markets, indices, and basic trading concepts", lessons:8, duration:"2 hours", skillPoints:25, rating:4.8, status:"published", providerId:"u5", enrolledCount:45, completedCount:38, category:"Fundamentals", createdAt:"2024-01-15" },
      { id:"c2", title:"Technical Analysis Fundamentals", description:"Master chart patterns, indicators, and technical trading strategies", lessons:12, duration:"4 hours", skillPoints:40, rating:4.6, status:"published", providerId:"u5", enrolledCount:38, completedCount:22, category:"Technical Analysis", createdAt:"2024-01-20" },
      { id:"c3", title:"Risk Management Strategies", description:"Understand position sizing, stop-losses, and portfolio risk management", lessons:10, duration:"3 hours", skillPoints:35, rating:4.9, status:"published", providerId:"u5", enrolledCount:32, completedCount:15, category:"Risk Management", createdAt:"2024-02-01" },
      { id:"c4", title:"Options Trading Basics", description:"Introduction to derivatives, options contracts, and hedging strategies", lessons:15, duration:"5 hours", skillPoints:50, rating:0, status:"draft", providerId:"u5", enrolledCount:0, completedCount:0, category:"Derivatives", createdAt:"2024-03-01" }
    ],

    enrollments: [
      { id:"e1", learnerId:"u6", courseId:"c1", progress:100, status:"completed", enrolledAt:"2024-02-01" },
      { id:"e2", learnerId:"u6", courseId:"c2", progress:65, status:"in_progress", enrolledAt:"2024-02-10" },
      { id:"e3", learnerId:"u6", courseId:"c3", progress:30, status:"in_progress", enrolledAt:"2024-02-20" },
      { id:"e4", learnerId:"u7", courseId:"c1", progress:80, status:"in_progress", enrolledAt:"2024-02-05" },
      { id:"e5", learnerId:"u8", courseId:"c1", progress:100, status:"completed", enrolledAt:"2024-02-03" },
      { id:"e6", learnerId:"u8", courseId:"c2", progress:50, status:"in_progress", enrolledAt:"2024-02-15" },
      { id:"e7", learnerId:"u10", courseId:"c1", progress:60, status:"in_progress", enrolledAt:"2024-02-20" },
      { id:"e8", learnerId:"u11", courseId:"c1", progress:40, status:"in_progress", enrolledAt:"2024-03-05" },
      { id:"e9", learnerId:"u12", courseId:"c1", progress:100, status:"completed", enrolledAt:"2024-03-10" },
      { id:"e10", learnerId:"u12", courseId:"c2", progress:75, status:"in_progress", enrolledAt:"2024-03-15" }
    ],

    assignments: [
      { id:"a1", title:"Swing Trading Challenge", description:"Generate 5% returns in tech sector using swing trading strategies over 2 weeks", instructorId:"u3", dueDate:"2026-04-10", difficulty:"Medium", skillPoints:50, status:"active", studentIds:["u6","u7","u8","u10","u11","u12"], completedIds:["u6","u8","u12"], createdAt:"2026-02-10" },
      { id:"a2", title:"Risk Management Assessment", description:"Maintain portfolio volatility below 12% for 2 weeks while executing at least 5 trades", instructorId:"u3", dueDate:"2026-04-15", difficulty:"Hard", skillPoints:75, status:"active", studentIds:["u6","u7","u8","u10","u11","u12"], completedIds:["u6","u8"], createdAt:"2026-02-15" },
      { id:"a3", title:"Sector Analysis – Banking", description:"Analyze and invest in banking sector stocks; write a brief report on your rationale", instructorId:"u3", dueDate:"2026-03-08", difficulty:"Easy", skillPoints:30, status:"completed", studentIds:["u6","u7","u8","u10","u11","u12"], completedIds:["u6","u7","u8","u10","u11"], createdAt:"2026-02-08" },
      { id:"a4", title:"Diversified Portfolio Build", description:"Build a portfolio with minimum 5 different sectors; target overall return of 8%", instructorId:"u3", dueDate:"2026-05-01", difficulty:"Medium", skillPoints:60, status:"active", studentIds:["u6","u7","u8","u10","u11","u12"], completedIds:[], createdAt:"2026-03-20" }
    ],

    quizzes: [
      { id:"q1", title:"Stock Market Basics Quiz", courseId:"c1", providerId:"u5", questions:10, timeLimit:20, passingScore:70, skillPointsOnPass:15, attempts:45, avgScore:78, passRate:85, status:"active", createdAt:"2024-02-01" },
      { id:"q2", title:"Technical Indicators Quiz", courseId:"c2", providerId:"u5", questions:15, timeLimit:25, passingScore:70, skillPointsOnPass:20, attempts:38, avgScore:65, passRate:72, status:"active", createdAt:"2024-02-10" },
      { id:"q3", title:"Risk Management Assessment", courseId:"c3", providerId:"u5", questions:12, timeLimit:20, passingScore:75, skillPointsOnPass:18, attempts:22, avgScore:82, passRate:90, status:"active", createdAt:"2024-02-20" }
    ],


    courseModules: [
      { id:"m1", courseId:"c1", type:"video", title:"Market Structure Basics", duration:"18 min", description:"Understand exchanges, indices, and how orders flow in the market.", order:1 },
      { id:"m2", courseId:"c1", type:"article", title:"Primary vs Secondary Market", duration:"6 min read", description:"Learn the difference between issuance and active trading.", order:2 },
      { id:"m3", courseId:"c1", type:"video", title:"Demat, Broker, and Order Types", duration:"24 min", description:"Walk through accounts, brokers, and basic order placement.", order:3 },
      { id:"m4", courseId:"c1", type:"quiz", title:"Stock Market Basics Quiz", duration:"10 questions", description:"Quick knowledge check on core stock market terms.", order:4 },
      { id:"m5", courseId:"c2", type:"video", title:"Reading Candlestick Charts", duration:"22 min", description:"Interpret open, high, low, and close using real chart examples.", order:1 },
      { id:"m6", courseId:"c2", type:"article", title:"Moving Averages and Momentum", duration:"8 min read", description:"A concise guide to trend-following indicators and momentum cues.", order:2 },
      { id:"m7", courseId:"c2", type:"video", title:"Support and Resistance Zones", duration:"26 min", description:"Identify key levels and trade reactions around them.", order:3 },
      { id:"m8", courseId:"c2", type:"quiz", title:"Technical Analysis Quiz", duration:"15 questions", description:"Assess chart-reading and indicator understanding.", order:4 },
      { id:"m9", courseId:"c3", type:"video", title:"Position Sizing Foundations", duration:"20 min", description:"Allocate capital correctly using risk-per-trade rules.", order:1 },
      { id:"m10", courseId:"c3", type:"article", title:"Stop Loss Planning", duration:"7 min read", description:"Set stop losses with logic instead of emotion.", order:2 },
      { id:"m11", courseId:"c3", type:"video", title:"Diversification and Exposure Limits", duration:"21 min", description:"Balance sector exposure and cap position concentration risk.", order:3 },
      { id:"m12", courseId:"c3", type:"quiz", title:"Risk Management Quiz", duration:"12 questions", description:"Validate understanding of risk-reward and capital protection.", order:4 }
    ],

    courseProgress: [
      { learnerId:"u6", courseId:"c1", completedModuleIds:["m1","m2","m3","m4"] },
      { learnerId:"u6", courseId:"c2", completedModuleIds:["m5","m6"] },
      { learnerId:"u6", courseId:"c3", completedModuleIds:["m9"] },
      { learnerId:"u7", courseId:"c1", completedModuleIds:["m1","m2","m3"] },
      { learnerId:"u8", courseId:"c1", completedModuleIds:["m1","m2","m3","m4"] },
      { learnerId:"u8", courseId:"c2", completedModuleIds:["m5","m6"] },
      { learnerId:"u10", courseId:"c1", completedModuleIds:["m1","m2"] },
      { learnerId:"u11", courseId:"c1", completedModuleIds:["m1"] },
      { learnerId:"u12", courseId:"c1", completedModuleIds:["m1","m2","m3","m4"] },
      { learnerId:"u12", courseId:"c2", completedModuleIds:["m5","m6","m7"] }
    ],

    sessions: [
      { id:"s1", title:"Introduction to Candlestick Patterns", instructorId:"u3", date:"2026-04-05", time:"10:00", duration:60, studentIds:["u6","u7","u8","u10","u11","u12"], status:"scheduled", type:"Trading Session" },
      { id:"s2", title:"Portfolio Review & Feedback", instructorId:"u3", date:"2026-04-08", time:"14:00", duration:90, studentIds:["u6","u7","u8","u10","u11","u12"], status:"scheduled", type:"Review Session" },
      { id:"s3", title:"Sector Rotation Strategy", instructorId:"u3", date:"2026-04-12", time:"11:00", duration:60, studentIds:["u6","u7","u8","u10","u11","u12"], status:"scheduled", type:"Trading Session" },
      { id:"s4", title:"Options Basics Intro", instructorId:"u4", date:"2026-04-06", time:"15:00", duration:45, studentIds:["u9","u13"], status:"scheduled", type:"Lecture" },
      { id:"s5", title:"Risk & Position Sizing Workshop", instructorId:"u3", date:"2026-04-20", time:"10:00", duration:120, studentIds:["u6","u7","u8","u10","u11","u12"], status:"scheduled", type:"Workshop" }
    ],

    trades: [
      { id:"t1",  learnerId:"u6",  symbol:"RELIANCE",   type:"BUY",  qty:50,  price:2450,  total:122500, date:"2026-03-01", status:"executed" },
      { id:"t2",  learnerId:"u6",  symbol:"TCS",        type:"BUY",  qty:30,  price:3680,  total:110400, date:"2026-03-03", status:"executed" },
      { id:"t3",  learnerId:"u6",  symbol:"INFY",       type:"BUY",  qty:40,  price:1580,  total:63200,  date:"2026-03-05", status:"executed" },
      { id:"t4",  learnerId:"u6",  symbol:"HDFCBANK",   type:"BUY",  qty:25,  price:1675,  total:41875,  date:"2026-03-07", status:"executed" },
      { id:"t5",  learnerId:"u6",  symbol:"INFY",       type:"SELL", qty:10,  price:1620,  total:16200,  date:"2026-03-10", status:"executed" },
      { id:"t6",  learnerId:"u8",  symbol:"TCS",        type:"BUY",  qty:20,  price:3700,  total:74000,  date:"2026-03-02", status:"executed" },
      { id:"t7",  learnerId:"u8",  symbol:"ZOMATO",     type:"BUY",  qty:100, price:240,   total:24000,  date:"2026-03-08", status:"executed" },
      { id:"t8",  learnerId:"u9",  symbol:"SBIN",       type:"BUY",  qty:50,  price:780,   total:39000,  date:"2026-03-04", status:"executed" },
      { id:"t9",  learnerId:"u9",  symbol:"TATAMOTORS", type:"BUY",  qty:30,  price:870,   total:26100,  date:"2026-03-09", status:"executed" },
      { id:"t10", learnerId:"u7",  symbol:"ITC",        type:"BUY",  qty:80,  price:462,   total:36960,  date:"2026-03-06", status:"executed" },
      { id:"t11", learnerId:"u7",  symbol:"WIPRO",      type:"BUY",  qty:60,  price:442,   total:26520,  date:"2026-03-11", status:"executed" },
      { id:"t12", learnerId:"u10", symbol:"HDFCBANK",   type:"BUY",  qty:20,  price:1680,  total:33600,  date:"2026-03-07", status:"executed" },
      { id:"t13", learnerId:"u10", symbol:"SBIN",       type:"BUY",  qty:40,  price:778,   total:31120,  date:"2026-03-12", status:"executed" },
      { id:"t14", learnerId:"u12", symbol:"BHARTIARTL", type:"BUY",  qty:35,  price:1575,  total:55125,  date:"2026-03-05", status:"executed" },
      { id:"t15", learnerId:"u12", symbol:"LT",         type:"BUY",  qty:15,  price:3400,  total:51000,  date:"2026-03-10", status:"executed" },
      { id:"t16", learnerId:"u12", symbol:"BHARTIARTL", type:"SELL", qty:10,  price:1590,  total:15900,  date:"2026-03-18", status:"executed" },
      { id:"t17", learnerId:"u11", symbol:"NTPC",       type:"BUY",  qty:100, price:383,   total:38300,  date:"2026-03-08", status:"executed" },
      { id:"t18", learnerId:"u11", symbol:"POWERGRID",  type:"BUY",  qty:80,  price:284,   total:22720,  date:"2026-03-15", status:"executed" }
    ],

    watchlists: [
      { id:"wl1", learnerId:"u6",  symbols:["RELIANCE","TCS","INFY","HDFCBANK","SBIN","BHARTIARTL"] },
      { id:"wl2", learnerId:"u7",  symbols:["ITC","WIPRO","NTPC"] },
      { id:"wl3", learnerId:"u8",  symbols:["ZOMATO","TCS","TATAMOTORS","BAJFINANCE"] },
      { id:"wl4", learnerId:"u12", symbols:["BHARTIARTL","LT","ADANIPORTS"] }
    ],

    notifications: [
      { id:"n1",  userId:"u6",  message:"New assignment: Swing Trading Challenge",                         type:"assignment",  read:false, createdAt:"2026-03-01" },
      { id:"n2",  userId:"u6",  message:"Session scheduled: Candlestick Patterns on Apr 5",               type:"session",     read:false, createdAt:"2026-03-20" },
      { id:"n3",  userId:"u6",  message:"You earned 30 skill points for completing Sector Analysis!",     type:"achievement", read:true,  createdAt:"2026-03-08" },
      { id:"n4",  userId:"u6",  message:"Instructor feedback: Great progress! Focus on diversification.", type:"feedback",    read:true,  createdAt:"2026-03-05" },
      { id:"n5",  userId:"u3",  message:"New learner Karan Mehta assigned to your class",                 type:"student",     read:false, createdAt:"2026-03-10" },
      { id:"n6",  userId:"u7",  message:"Reminder: Risk Management Assessment due Apr 15",                type:"assignment",  read:false, createdAt:"2026-03-22" },
      { id:"n7",  userId:"u8",  message:"🏆 Swing Trading Challenge completed! +50 skill points",         type:"achievement", read:false, createdAt:"2026-03-15" },
      { id:"n8",  userId:"u12", message:"Welcome to IndAI! Your first assignment has been posted.",        type:"info",        read:false, createdAt:"2026-03-10" },
      { id:"n9",  userId:"u6",  message:"New assignment: Diversified Portfolio Build – due May 1",         type:"assignment",  read:false, createdAt:"2026-03-20" }
    ],

    videoLibrary: [
      { id:"v1", providerId:"u5", title:"Understanding Candlestick Charts", description:"A comprehensive intro to reading candlestick patterns in technical analysis.", status:"published", views:142, sizeMB:128, duration:"12:34", uploadedAt:"2024-02-01" },
      { id:"v2", providerId:"u5", title:"Moving Averages Explained", description:"How to use SMA, EMA and crossover strategies for trading signals.", status:"published", views:99, sizeMB:195, duration:"18:22", uploadedAt:"2024-02-05" },
      { id:"v3", providerId:"u5", title:"Risk vs Reward Ratio", description:"Position sizing fundamentals and how to calculate ideal risk/reward ratios.", status:"draft", views:76, sizeMB:87, duration:"09:15", uploadedAt:"2024-02-12" }
    ],


    // ---- 50+ Stocks across all sectors/caps ----
    stocks: [
      // === LARGE CAP – IT ===
      { symbol:"TCS",        name:"Tata Consultancy Services",   price:3725,   change:1.22,  cap:"Large Cap", sector:"IT",             marketCap:"13.5L Cr", vol:"18.2M" },
      { symbol:"INFY",       name:"Infosys Limited",             price:1545,   change:-2.22, cap:"Large Cap", sector:"IT",             marketCap:"6.4L Cr",  vol:"28.4M" },
      { symbol:"HCLTECH",    name:"HCL Technologies",            price:1620,   change:1.85,  cap:"Large Cap", sector:"IT",             marketCap:"4.4L Cr",  vol:"19.8M" },
      { symbol:"TECHM",      name:"Tech Mahindra",               price:1385,   change:-0.65, cap:"Large Cap", sector:"IT",             marketCap:"1.3L Cr",  vol:"22.1M" },
      // === LARGE CAP – Banking ===
      { symbol:"HDFCBANK",   name:"HDFC Bank",                   price:1710,   change:2.09,  cap:"Large Cap", sector:"Banking",        marketCap:"12.0L Cr", vol:"31.8M" },
      { symbol:"ICICIBANK",  name:"ICICI Bank",                  price:1125,   change:-0.45, cap:"Large Cap", sector:"Banking",        marketCap:"7.9L Cr",  vol:"41.3M" },
      { symbol:"SBIN",       name:"State Bank of India",         price:785,    change:-1.15, cap:"Large Cap", sector:"Banking",        marketCap:"7.0L Cr",  vol:"78.2M" },
      { symbol:"KOTAKBANK",  name:"Kotak Mahindra Bank",         price:1875,   change:1.65,  cap:"Large Cap", sector:"Banking",        marketCap:"3.7L Cr",  vol:"16.9M" },
      { symbol:"HDFCLIFE",   name:"HDFC Life Insurance",         price:620,    change:0.95,  cap:"Large Cap", sector:"Banking",        marketCap:"1.3L Cr",  vol:"14.5M" },
      // === LARGE CAP – Energy ===
      { symbol:"RELIANCE",   name:"Reliance Industries",         price:2520,   change:2.86,  cap:"Large Cap", sector:"Energy",         marketCap:"17.2L Cr", vol:"24.3M" },
      { symbol:"ONGC",       name:"Oil & Natural Gas Corp",      price:265,    change:1.45,  cap:"Large Cap", sector:"Energy",         marketCap:"3.3L Cr",  vol:"62.4M" },
      { symbol:"BPCL",       name:"Bharat Petroleum Corp",       price:345,    change:2.15,  cap:"Large Cap", sector:"Energy",         marketCap:"1.5L Cr",  vol:"38.7M" },
      { symbol:"IOC",        name:"Indian Oil Corporation",      price:175,    change:-0.85, cap:"Large Cap", sector:"Energy",         marketCap:"2.5L Cr",  vol:"55.2M" },
      // === LARGE CAP – FMCG ===
      { symbol:"ITC",        name:"ITC Limited",                 price:465,    change:0.95,  cap:"Large Cap", sector:"FMCG",           marketCap:"5.8L Cr",  vol:"85.5M" },
      { symbol:"HINDUNILVR", name:"Hindustan Unilever",          price:2450,   change:1.25,  cap:"Large Cap", sector:"FMCG",           marketCap:"5.7L Cr",  vol:"12.8M" },
      { symbol:"NESTLEIND",  name:"Nestle India",                price:2285,   change:0.75,  cap:"Large Cap", sector:"FMCG",           marketCap:"2.2L Cr",  vol:"4.2M"  },
      { symbol:"DABUR",      name:"Dabur India",                 price:525,    change:-0.45, cap:"Large Cap", sector:"FMCG",           marketCap:"0.9L Cr",  vol:"18.4M" },
      // === LARGE CAP – Telecom ===
      { symbol:"BHARTIARTL", name:"Bharti Airtel",               price:1580,   change:2.15,  cap:"Large Cap", sector:"Telecom",        marketCap:"9.3L Cr",  vol:"22.8M" },
      { symbol:"VODAIDEA",   name:"Vodafone Idea",               price:14.5,   change:-3.25, cap:"Large Cap", sector:"Telecom",        marketCap:"0.8L Cr",  vol:"320M"  },
      // === LARGE CAP – Pharma ===
      { symbol:"SUNPHARMA",  name:"Sun Pharmaceutical",          price:1685,   change:-0.85, cap:"Large Cap", sector:"Pharma",         marketCap:"4.0L Cr",  vol:"18.8M" },
      { symbol:"DRREDDY",    name:"Dr. Reddy's Laboratories",    price:5850,   change:1.35,  cap:"Large Cap", sector:"Pharma",         marketCap:"0.98L Cr", vol:"5.4M"  },
      { symbol:"CIPLA",      name:"Cipla Limited",               price:1425,   change:0.65,  cap:"Large Cap", sector:"Pharma",         marketCap:"1.1L Cr",  vol:"11.2M" },
      // === LARGE CAP – Automobile ===
      { symbol:"MARUTI",     name:"Maruti Suzuki",               price:12450,  change:1.65,  cap:"Large Cap", sector:"Automobile",     marketCap:"3.3L Cr",  vol:"5.2M"  },
      { symbol:"BAJAJ-AUTO", name:"Bajaj Auto",                  price:8750,   change:2.45,  cap:"Large Cap", sector:"Automobile",     marketCap:"2.5L Cr",  vol:"3.8M"  },
      { symbol:"M&M",        name:"Mahindra & Mahindra",         price:2875,   change:3.15,  cap:"Large Cap", sector:"Automobile",     marketCap:"3.6L Cr",  vol:"14.2M" },
      // === LARGE CAP – Infrastructure ===
      { symbol:"LT",         name:"Larsen & Toubro",             price:3420,   change:3.12,  cap:"Large Cap", sector:"Infrastructure", marketCap:"4.8L Cr",  vol:"10.7M" },
      { symbol:"ULTRACEMCO",  name:"UltraTech Cement",           price:10850,  change:1.85,  cap:"Large Cap", sector:"Infrastructure", marketCap:"3.1L Cr",  vol:"2.8M"  },
      { symbol:"ADANIENT",   name:"Adani Enterprises",           price:2485,   change:4.25,  cap:"Large Cap", sector:"Infrastructure", marketCap:"2.8L Cr",  vol:"15.6M" },
      // === MID CAP – IT ===
      { symbol:"WIPRO",      name:"Wipro Limited",               price:445,    change:1.85,  cap:"Mid Cap",   sector:"IT",             marketCap:"2.3L Cr",  vol:"42.5M" },
      { symbol:"MPHASIS",    name:"Mphasis Limited",             price:2450,   change:0.75,  cap:"Mid Cap",   sector:"IT",             marketCap:"0.46L Cr", vol:"6.2M"  },
      { symbol:"PERSISTENT", name:"Persistent Systems",          price:4850,   change:2.35,  cap:"Mid Cap",   sector:"IT",             marketCap:"0.74L Cr", vol:"4.8M"  },
      { symbol:"LTIM",       name:"LTIMindtree",                 price:5120,   change:-1.45, cap:"Mid Cap",   sector:"IT",             marketCap:"1.5L Cr",  vol:"5.2M"  },
      // === MID CAP – Banking ===
      { symbol:"AXISBANK",   name:"Axis Bank",                   price:1098,   change:-1.25, cap:"Mid Cap",   sector:"Banking",        marketCap:"3.3L Cr",  vol:"90.9M" },
      { symbol:"IDFCFIRSTB", name:"IDFC First Bank",             price:72,     change:1.85,  cap:"Mid Cap",   sector:"Banking",        marketCap:"0.51L Cr", vol:"145M"  },
      { symbol:"BANDHANBNK", name:"Bandhan Bank",                price:185,    change:-2.35, cap:"Mid Cap",   sector:"Banking",        marketCap:"0.29L Cr", vol:"68.4M" },
      // === MID CAP – Automobile ===
      { symbol:"TATAMOTORS", name:"Tata Motors",                 price:875,    change:4.25,  cap:"Mid Cap",   sector:"Automobile",     marketCap:"3.2L Cr",  vol:"52.3M" },
      { symbol:"HEROMOTOCO", name:"Hero MotoCorp",               price:4250,   change:1.15,  cap:"Mid Cap",   sector:"Automobile",     marketCap:"0.85L Cr", vol:"7.8M"  },
      { symbol:"EICHERMOT",  name:"Eicher Motors",               price:4580,   change:2.85,  cap:"Mid Cap",   sector:"Automobile",     marketCap:"1.25L Cr", vol:"5.5M"  },
      // === MID CAP – Pharma ===
      { symbol:"LUPIN",      name:"Lupin Limited",               price:1950,   change:1.65,  cap:"Mid Cap",   sector:"Pharma",         marketCap:"0.88L Cr", vol:"9.4M"  },
      { symbol:"DIVISLAB",   name:"Divi's Laboratories",         price:3850,   change:-0.45, cap:"Mid Cap",   sector:"Pharma",         marketCap:"1.02L Cr", vol:"3.8M"  },
      { symbol:"ALKEM",      name:"Alkem Laboratories",          price:5250,   change:0.85,  cap:"Mid Cap",   sector:"Pharma",         marketCap:"0.63L Cr", vol:"2.4M"  },
      // === MID CAP – FMCG / Consumer ===
      { symbol:"TITAN",      name:"Titan Company",               price:3520,   change:2.95,  cap:"Mid Cap",   sector:"Consumer",       marketCap:"3.1L Cr",  vol:"10.2M" },
      { symbol:"GODREJCP",   name:"Godrej Consumer Products",    price:1150,   change:1.45,  cap:"Mid Cap",   sector:"Consumer",       marketCap:"1.17L Cr", vol:"8.6M"  },
      { symbol:"MARICO",     name:"Marico Limited",              price:585,    change:0.65,  cap:"Mid Cap",   sector:"FMCG",           marketCap:"0.76L Cr", vol:"12.4M" },
      // === MID CAP – Infrastructure / Power ===
      { symbol:"ADANIPORTS",  name:"Adani Ports",                price:1245,   change:3.45,  cap:"Mid Cap",   sector:"Infrastructure", marketCap:"2.7L Cr",  vol:"28.4M" },
      { symbol:"POWERGRID",  name:"Power Grid Corp",             price:285,    change:1.25,  cap:"Mid Cap",   sector:"Power",          marketCap:"2.6L Cr",  vol:"42.8M" },
      { symbol:"NTPC",       name:"NTPC Limited",                price:385,    change:-0.75, cap:"Mid Cap",   sector:"Power",          marketCap:"3.7L Cr",  vol:"58.3M" },
      { symbol:"TATAPOWER",  name:"Tata Power Company",          price:425,    change:2.85,  cap:"Mid Cap",   sector:"Power",          marketCap:"1.36L Cr", vol:"38.5M" },
      // === MID CAP – NBFC / Finance ===
      { symbol:"BAJFINANCE",  name:"Bajaj Finance",              price:7845,   change:2.45,  cap:"Mid Cap",   sector:"NBFC",           marketCap:"4.8L Cr",  vol:"8.5M"  },
      { symbol:"BAJAJFINSV",  name:"Bajaj Finserv",              price:1645,   change:1.85,  cap:"Mid Cap",   sector:"NBFC",           marketCap:"2.6L Cr",  vol:"11.2M" },
      { symbol:"MUTHOOTFIN",  name:"Muthoot Finance",            price:1850,   change:3.25,  cap:"Mid Cap",   sector:"NBFC",           marketCap:"0.74L Cr", vol:"9.8M"  },
      // === SMALL CAP – Technology ===
      { symbol:"ZOMATO",     name:"Zomato Limited",              price:245,    change:5.45,  cap:"Small Cap", sector:"Technology",     marketCap:"2.1L Cr",  vol:"198M"  },
      { symbol:"NAUKRI",     name:"Info Edge (Naukri)",          price:6250,   change:2.15,  cap:"Small Cap", sector:"Technology",     marketCap:"0.81L Cr", vol:"2.8M"  },
      { symbol:"INDIAMART",  name:"IndiaMART InterMESH",         price:2285,   change:-1.45, cap:"Small Cap", sector:"Technology",     marketCap:"0.14L Cr", vol:"3.6M"  },
      // === SMALL CAP – Fintech ===
      { symbol:"PAYTM",      name:"Paytm (One97 Comm.)",         price:875,    change:-3.25, cap:"Small Cap", sector:"Fintech",        marketCap:"0.6L Cr",  vol:"95.0M" },
      { symbol:"POLICYBZR",  name:"PB Fintech (PolicyBazaar)",   price:1285,   change:4.15,  cap:"Small Cap", sector:"Fintech",        marketCap:"0.56L Cr", vol:"12.4M" },
      // === SMALL CAP – E-commerce / Consumer ===
      { symbol:"NYKAA",      name:"Nykaa (FSN E-Com)",           price:185,    change:2.85,  cap:"Small Cap", sector:"E-commerce",     marketCap:"0.5L Cr",  vol:"92.3M" },
      { symbol:"SHOPERSTOP", name:"Shoppers Stop",               price:785,    change:1.65,  cap:"Small Cap", sector:"E-commerce",     marketCap:"0.08L Cr", vol:"4.8M"  },
      // === SMALL CAP – Pharma ===
      { symbol:"AUROPHARMA",  name:"Aurobindo Pharma",           price:1145,   change:-0.95, cap:"Small Cap", sector:"Pharma",         marketCap:"0.67L Cr", vol:"11.5M" },
      { symbol:"GLENMARK",   name:"Glenmark Pharmaceuticals",    price:1085,   change:2.45,  cap:"Small Cap", sector:"Pharma",         marketCap:"0.31L Cr", vol:"8.2M"  },
      // === SMALL CAP – Media / Entertainment ===
      { symbol:"ZEEL",       name:"Zee Entertainment",           price:285,    change:1.45,  cap:"Small Cap", sector:"Media",          marketCap:"2.7L Cr",  vol:"30.5M" },
      { symbol:"PVRCINEMAS",  name:"PVR Inox",                   price:1485,   change:-2.15, cap:"Small Cap", sector:"Media",          marketCap:"0.18L Cr", vol:"6.8M"  },
      // === SMALL CAP – Travel / Hospitality ===
      { symbol:"IRCTC",      name:"IRCTC",                       price:845,    change:4.15,  cap:"Small Cap", sector:"Travel",         marketCap:"6.7L Cr",  vol:"15.7M" },
      { symbol:"LEMONTRE",   name:"Lemon Tree Hotels",           price:145,    change:3.25,  cap:"Small Cap", sector:"Travel",         marketCap:"0.15L Cr", vol:"28.4M" },
      // === SMALL CAP – Automobile ===
      { symbol:"TVSMOTOR",   name:"TVS Motor Company",           price:2485,   change:3.85,  cap:"Small Cap", sector:"Automobile",     marketCap:"1.18L Cr", vol:"8.4M"  },
      { symbol:"BALKRISIND",  name:"Balkrishna Industries",      price:2850,   change:1.45,  cap:"Small Cap", sector:"Automobile",     marketCap:"0.55L Cr", vol:"5.2M"  },
      // === SMALL CAP – Telecom / Infrastructure ===
      { symbol:"INDUS",      name:"Indus Towers",                price:385,    change:2.65,  cap:"Small Cap", sector:"Telecom",        marketCap:"1.01L Cr", vol:"24.8M" }
    ],

    config: {
      maxTradingLimit: 200000,
      maxSkillPointsPerChallenge: 100,
      minSkillPointsMarginTrading: 500,
      maxDailyTrades: 50,
      tradeCooldownMinutes: 5,
      features: { marginTrading: false, cryptoTrading: true, forexTrading: false }
    },

    // ---- Pending approvals (instructor/provider/admin accounts awaiting super-admin OK) ----
    pendingApprovals: [],
    completionApprovals: []
  };
}

// ---- Active data object ----
let IndAIData = normalizeData(getDefaultData());


function normalizeData(data) {
  const safe = data || getDefaultData();
  const seenUsers = new Set();
  safe.users = (safe.users || []).filter(Boolean).filter(u => {
    const email = String(u.email || '').toLowerCase();
    if (!email || seenUsers.has(email)) return false;
    seenUsers.add(email);
    u.skillPoints = Number(u.skillPoints || 0);
    u.portfolioValue = Number(u.portfolioValue || 0);
    u.tradingLimit = Number(u.tradingLimit || 0);
    u.virtualBalance = Number(u.virtualBalance || 0);
    u.status = u.status || 'active';
    return true;
  });
  safe.trades = (safe.trades || []).filter(t => t && t.learnerId && t.symbol && Number(t.qty) > 0 && Number(t.price) > 0)
    .map(t => ({ ...t, qty:Number(t.qty), price:Number(t.price), total:Number((Number(t.total || (t.qty*t.price))).toFixed(2)) }));
  safe.watchlists = (safe.watchlists || []).map((w,idx) => ({ ...w, userId: w.userId || w.learnerId, learnerId: w.learnerId || w.userId, name: w.name || `Watchlist ${idx+1}`, active: typeof w.active === 'boolean' ? w.active : idx === 0, symbols:[...(new Set(w.symbols || []))] }));
  safe.assignments = (safe.assignments || []).map(a => ({ ...a, completedIds: [...new Set(a.completedIds || [])], pendingCompletedIds: [...new Set(a.pendingCompletedIds || [])] }));
  safe.videoLibrary = (safe.videoLibrary || []).map(v => ({ ...v, sizeMB: Number(v.sizeMB || 0), views: Number(v.views || 0) }));
  safe.courseModules = (safe.courseModules || []).map(m => ({ ...m, order: Number(m.order || 0) }));
  safe.courseProgress = (safe.courseProgress || []).map(cp => ({ ...cp, completedModuleIds: [...new Set(cp.completedModuleIds || [])] }));
  (safe.enrollments || []).forEach(e => {
    const modules = safe.courseModules.filter(m => m.courseId === e.courseId);
    const cp = safe.courseProgress.find(r => r.learnerId === e.learnerId && r.courseId === e.courseId);
    if (modules.length && cp) {
      const completed = cp.completedModuleIds.filter(id => modules.some(m => m.id === id)).length;
      e.progress = Math.round((completed / modules.length) * 100);
      if (!['completed', 'pending_approval'].includes(e.status)) {
        e.status = completed >= modules.length ? 'completed' : 'in_progress';
      }
    }
  });
  safe.pendingApprovals = safe.pendingApprovals || [];
  safe.completionApprovals = (safe.completionApprovals || []).map(a => ({ ...a, status: a.status || 'pending' }));
  return safe;
}


// ---- Persistence ----
function persistData() {
  try {
    localStorage.setItem("indai_data", JSON.stringify(IndAIData));
    localStorage.setItem("indai_version", DATA_VERSION);
  } catch(e) { /* persistence unavailable */ }
}

function loadData() {
  try {
    const storedVersion = localStorage.getItem("indai_version");
    if (storedVersion !== DATA_VERSION) {

      localStorage.removeItem("indai_data");
      localStorage.removeItem("indai_version");
      return;
    }
    const stored = localStorage.getItem("indai_data");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (!parsed || !Array.isArray(parsed.users) || parsed.users.length === 0) {

      return;
    }
    IndAIData = normalizeData({ ...IndAIData, ...parsed });
  } catch(e) { /* load fallback to default seed data */ }
}

loadData();
