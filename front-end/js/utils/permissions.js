// ============================================================
// IndAI Platform – Permissions, Shared Helpers, Quiz Engine
// Depends on: mockData.js (genId, todayISO, persistData)
//             auth.js (UI, Validate)
// ============================================================

// ---- Centralized Role Permissions ----
const Permissions = {
  superuser: [
    "view_all_users", "create_user", "edit_user", "delete_user",
    "view_all_courses", "create_course", "edit_course", "delete_course",
    "view_all_assignments", "create_assignment", "edit_assignment", "delete_assignment",
    "view_all_sessions", "create_session", "edit_session", "delete_session",
    "edit_config", "view_analytics", "manage_features",
    "view_all_trades", "award_skill_points", "manage_roles"
  ],
  admin: [
    "view_all_users", "create_user", "edit_user", "delete_user",
    "view_all_assignments", "create_assignment", "edit_assignment", "delete_assignment",
    "view_all_sessions",
    "edit_config", "view_analytics", "manage_features",
    "award_skill_points"
  ],
  instructor: [
    "view_own_students", "award_skill_points", "edit_student_limit",
    "create_assignment", "edit_assignment", "delete_assignment",
    "create_session", "edit_session", "delete_session",
    "view_student_trades", "send_feedback"
  ],
  provider: [
    "create_course", "edit_own_course", "delete_own_course",
    "create_quiz", "edit_quiz", "delete_quiz",
    "view_course_analytics"
  ],
  learner: [
    "execute_trade", "view_own_portfolio", "view_own_trades",
    "view_watchlist", "edit_watchlist",
    "view_courses", "view_assignments", "view_sessions",
    "view_notifications", "edit_own_profile", "change_password"
  ]
};

/** Check if a role has a specific permission */
function can(role, permission) {
  return (Permissions[role] || []).includes(permission);
}

/** Auto-hide DOM elements whose data-requires attribute the current role lacks */
function applyRoleUI(role) {
  document.querySelectorAll("[data-requires]").forEach(el => {
    if (!can(role, el.dataset.requires)) el.style.display = "none";
  });
}

// ---- Shared Formatting Helpers live in mockData.js (loaded first) ----
// fmtINR, fmtPct, gainLossClass, emptyState, getRoleChip, getDiffBadge, getStatusBadge

// ---- FormValidator ----
const FormValidator = {
  validate(rules) {
    return window.Validation ? Validation.validate(rules) : true;
  },
  required(id, label) { return Validation.required(id, label); },
  select(id, label) { return Validation.select(id, label); },
  positiveInt(id, label, min = 1, max = Infinity) { return Validation.positiveInt(id, label, min, max); },
  email(id) { return Validation.email(id, 'Email'); },
  futureDate(id, label) { return Validation.futureDate(id, label); },
  saneFutureDate(id, label, maxDays = 365) { return Validation.saneFutureDate(id, label, maxDays); },
  minAge(id, label = 'Date of Birth', years = 10) { return Validation.minAge(id, label, years); },
  notStartingWithNumber(id, label) { return Validation.notStartingWithNumber(id, label); },
  name(id, label, min = 3) { return Validation.name(id, label, min); },
  phone(id, label = 'Phone number') { return Validation.phone(id, label); },
  minLength(id, label, min = 3) { return Validation.minLength(id, label, min); }
};

// ---- Leaderboard Renderer ----
function renderLeaderboard(students, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sorted = [...students]
    .filter(s => s.role === "learner")
    .sort((a, b) => (b.portfolioValue || 0) - (a.portfolioValue || 0));

  if (!sorted.length) {
    container.innerHTML = emptyState("LB", "No students yet");
    return;
  }

  const medals = ["#1", "#2", "#3"];
  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Portfolio</th>
            <th>Returns</th>
            <th>Skill Pts</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((s, i) => {
            const ret = ((s.portfolioValue - 100000) / 100000 * 100);
            return `<tr ${i < 3 ? 'style="background:var(--gray-50);"' : ""}>
              <td style="font-size:1.1rem; text-align:center;">${medals[i] || "#" + (i + 1)}</td>
              <td style="font-weight:700;">${s.firstName} ${s.lastName}</td>
              <td style="font-weight:700;">${fmtINR(s.portfolioValue || 0)}</td>
              <td class="${gainLossClass(ret)}">${fmtPct(ret)}</td>
              <td style="color:var(--orange); font-weight:700;">${s.skillPoints || 0}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

// ---- Quiz Engine ----
const QuizEngine = {
  // Question pools keyed by course title
  _pools: {
    "Introduction to Stock Markets": [
      { q: "What does NSE stand for?",
        options: ["National Stock Exchange", "New Stock Entity", "National Securities Establishment", "None"], ans: 0 },
      { q: "How many companies does SENSEX track?",
        options: ["30", "50", "100", "200"], ans: 0 },
      { q: "What is a bull market?",
        options: ["Falling prices", "Rising prices", "Stable prices", "Volatile prices"], ans: 1 },
      { q: "IPO stands for?",
        options: ["Initial Public Offering", "Internal Price Option", "Index Portfolio Order", "None"], ans: 0 },
      { q: "Which instrument gives ownership in a company?",
        options: ["Bond", "Equity Share", "Debenture", "Mutual Fund"], ans: 1 }
    ],
    "Technical Analysis Fundamentals": [
      { q: "RSI stands for?",
        options: ["Relative Strength Index", "Real Stock Indicator", "Ratio Signal Index", "None"], ans: 0 },
      { q: "What does a Doji candlestick indicate?",
        options: ["Strong buying pressure", "Market indecision", "Strong selling pressure", "Gap up"], ans: 1 },
      { q: "MACD is primarily used to detect?",
        options: ["Volume spikes", "Momentum changes", "Dividend yield", "Market cap"], ans: 1 },
      { q: "A Head and Shoulders pattern signals a?",
        options: ["Trend continuation", "Trend reversal", "Consolidation phase", "Breakout"], ans: 1 },
      { q: "A support level is a price where the stock tends to?",
        options: ["Fall sharply", "Bounce upward", "Stay flat forever", "Gap down"], ans: 1 }
    ],
    "Risk Management Strategies": [
      { q: "A stop-loss order is used to?",
        options: ["Maximize profits", "Limit potential losses", "Track dividends", "Increase leverage"], ans: 1 },
      { q: "Portfolio diversification means?",
        options: ["Investing in one stock", "Spreading across different assets", "Day trading only", "Short selling"], ans: 1 },
      { q: "What is the risk-reward ratio?",
        options: ["Profit / Loss", "Loss / Profit", "Return / Risk", "None of above"], ans: 0 },
      { q: "Maximum drawdown refers to?",
        options: ["Biggest single-day gain", "Largest peak-to-trough decline", "Average daily return", "None"], ans: 1 },
      { q: "Position sizing determines?",
        options: ["When to enter a trade", "How much capital to allocate", "Which stock to buy", "None"], ans: 1 }
    ]
  },

  _defaults: [
    { q: "What is paper trading?",
      options: ["Trading on paper certificates", "Simulated trading with no real money", "Bond trading", "None"], ans: 1 },
    { q: "Market capitalization equals?",
      options: ["Annual revenue", "Total shares × current price", "Net profit", "Book value"], ans: 1 },
    { q: "Portfolio rebalancing means?",
      options: ["Selling all your assets", "Adjusting asset allocation to target weights", "Buying only index funds", "None"], ans: 1 },
    { q: "Which index tracks the top 50 Indian companies?",
      options: ["SENSEX", "NIFTY 50", "BSE 100", "NIFTY Bank"], ans: 1 },
    { q: "What does P/E ratio measure?",
      options: ["Profit per employee", "Price relative to earnings", "Portfolio efficiency", "None"], ans: 1 }
  ],

  /** Generate 5 questions for a given course title */
  generateQuestions(courseTitle) {
    return (this._pools[courseTitle] || this._defaults).slice(0, 5);
  },

  /** Score a submitted quiz; returns { correct, total, pct } */
  score(questions, answers) {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    return {
      correct,
      total: questions.length,
      pct: Math.round((correct / questions.length) * 100)
    };
  }
};
