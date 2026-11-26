import * as auth from "./slices/authSlice.js";
import * as user from "./slices/userSlice.js";
import * as market from "./slices/marketSlice.js";
import * as trading from "./slices/tradingSlice.js";
import * as portfolio from "./slices/portfolioSlice.js";
import * as watchlist from "./slices/watchlistSlice.js";
import * as course from "./slices/courseSlice.js";
import * as resource from "./slices/resourceSlice.js";
import * as quiz from "./slices/quizSlice.js";
import * as guidance from "./slices/guidanceSlice.js";
import * as task from "./slices/taskSlice.js";
import * as payment from "./slices/paymentSlice.js";
import * as commerce from "./slices/commerceSlice.js";
import * as notification from "./slices/notificationSlice.js";
import * as support from "./slices/supportSlice.js";
import * as dashboard from "./slices/dashboardSlice.js";

export const features = {
  auth,
  user,
  market,
  trading,
  portfolio,
  watchlist,
  course,
  resource,
  quiz,
  guidance,
  task,
  payment,
  commerce,
  notification,
  support,
  dashboard,
};

export function resourceKey(path) {
  if (!path) return null;
  const [base, search] = path.split("?");
  const params = new URLSearchParams(search);
  if (params.get("page") === "0") params.delete("page");
  params.sort();
  return base + (params.size ? "?" + params.toString() : "");
}
export function domainFor(path) {
  const [base, search] = path.split("?");
  if (base === "/me" || base.startsWith("/auth") || base === "/applications")
    return "auth";
  if (base === "/admin") {
    return (
      {
        users: "user",
        staff: "user",
        payments: "payment",
        courses: "course",
        support: "support",
      }[new URLSearchParams(search).get("queue")] || "dashboard"
    );
  }
  if (/^\/(admin\/)?notifications/.test(base)) return "notification";
  if (
    /^\/admin\/(applications|staff|users)/.test(base) ||
    base.startsWith("/members")
  )
    return "user";
  if (base.startsWith("/teaching/learners")) return "guidance";
  if (base.startsWith("/trading/watchlists")) return "watchlist";
  if (/^\/trading\/(account|ledger|journal)/.test(base)) return "portfolio";
  if (/^\/trading\/(orders|reset)/.test(base)) return "trading";
  if (base.startsWith("/trading/")) return "market";
  if (/^\/(resources|resource-files)/.test(base)) return "resource";
  if (/^\/(quizzes|quiz-attempts)/.test(base)) return "quiz";
  if (/^\/(guidance|staff)/.test(base)) return "guidance";
  if (/^\/(tasks|assignments|submissions|milestones|learning-plans)/.test(base))
    return "task";
  if (/^\/(plans|payments|admin\/payments)/.test(base)) return "payment";
  if (/^\/(provider|commerce|settlements)/.test(base) || /\/terms/.test(base))
    return "commerce";
  if (base.startsWith("/courses")) return "course";
  if (base.startsWith("/support")) return "support";
  if (["/config", "/health", "/ready"].includes(base)) return "dashboard";
  throw new Error("Unmapped API resource: " + path);
}
const readers = {
  auth: auth.fetchCurrentUser,
  user: user.fetchUsers,
  market: market.fetchMarketData,
  trading: trading.fetchOrders,
  portfolio: portfolio.fetchPortfolio,
  watchlist: watchlist.fetchWatchlists,
  course: course.fetchCourses,
  resource: resource.fetchResources,
  quiz: quiz.fetchQuizzes,
  guidance: guidance.fetchGuidance,
  task: task.fetchTasks,
  payment: payment.fetchPayments,
  commerce: commerce.fetchCommerce,
  notification: notification.fetchNotifications,
  support: support.fetchSupportTickets,
  dashboard: dashboard.fetchDashboard,
};
export const readerFor = (path) => readers[domainFor(path)];

// Every supported write maps to a named thunk, verified against back-end/routes.
const writes = [
  ["POST", /^\/auth\/login$/, auth.loginUser],
  ["POST", /^\/auth\/register$/, auth.registerUser],
  ["POST", /^\/auth\/verify$/, auth.verifyEmail],
  ["POST", /^\/auth\/resend$/, auth.resendVerification],
  ["POST", /^\/auth\/recovery$/, auth.requestRecovery],
  ["POST", /^\/auth\/reset$/, auth.resetPassword],
  ["POST", /^\/auth\/logout$/, auth.logoutUser],
  ["POST", /^\/auth\/change-password$/, auth.changePassword],
  ["POST", /^\/applications$/, auth.resubmitApplication],
  ["POST", /^\/members$/, user.createUser],
  ["PUT", /^\/members\/\d+\/profile$/, user.updateUser],
  ["POST", /^\/members\/\d+\/status$/, user.updateUserStatus],
  ["POST", /^\/members\/\d+\/permissions$/, user.updatePermissions],
  ["POST", /^\/members\/\d+\/revoke-sessions$/, user.revokeSessions],
  ["POST", /^\/members\/\d+\/reset-password$/, user.startMemberRecovery],
  ["POST", /^\/members\/\d+\/notes$/, user.addMemberNote],
  ["POST", /^\/admin\/applications\/\d+$/, user.decideApplication],
  ["POST", /^\/admin\/staff\/\d+\/decision$/, user.decideStaff],
  ["POST", /^\/admin\/users\/\d+\/suspend$/, user.suspendUser],
  ["POST", /^\/trading\/orders$/, trading.placeOrder],
  ["POST", /^\/trading\/orders\/\d+\/cancel$/, trading.cancelOrder],
  ["POST", /^\/trading\/reset$/, trading.resetPaperAccount],
  ["POST", /^\/trading\/journal$/, portfolio.createJournalEntry],
  ["POST", /^\/trading\/watchlists$/, watchlist.createWatchlist],
  ["PUT", /^\/trading\/watchlists\/\d+$/, watchlist.updateWatchlist],
  ["DELETE", /^\/trading\/watchlists\/\d+$/, watchlist.deleteWatchlist],
  ["POST", /^\/courses\/\d+\/terms$/, commerce.submitProposal],
  ["POST", /^\/courses\/\d+\/terms\/respond$/, commerce.respondToProposal],
  ["POST", /^\/courses$/, course.createCourse],
  ["PUT", /^\/courses\/\d+$/, course.updateCourse],
  ["DELETE", /^\/courses\/\d+$/, course.deleteCourse],
  ["POST", /^\/courses\/\d+\/lessons$/, course.createLesson],
  ["POST", /^\/courses\/\d+\/submit$/, course.submitCourse],
  ["POST", /^\/courses\/\d+\/review$/, course.reviewCourse],
  ["POST", /^\/courses\/\d+\/enroll$/, course.enrollCourse],
  ["POST", /^\/courses\/\d+\/lessons\/\d+\/complete$/, course.completeLesson],
  ["POST", /^\/resources\/[^/]+\/\d+\/upload$/, resource.uploadResource],
  ["DELETE", /^\/resource-files\/\d+$/, resource.deleteResource],
  ["POST", /^\/quizzes$/, quiz.createQuiz],
  ["PUT", /^\/quizzes\/\d+$/, quiz.updateQuiz],
  ["POST", /^\/quizzes\/\d+\/publish$/, quiz.publishQuiz],
  ["POST", /^\/quizzes\/\d+\/archive$/, quiz.archiveQuiz],
  ["PUT", /^\/quizzes\/\d+\/draft$/, quiz.saveQuizDraft],
  ["POST", /^\/quizzes\/\d+\/submit$/, quiz.submitQuiz],
  ["POST", /^\/quiz-attempts\/\d+\/grade$/, quiz.gradeQuiz],
  ["POST", /^\/guidance$/, guidance.requestGuidance],
  ["POST", /^\/guidance\/\d+\/decision$/, guidance.decideGuidance],
  ["POST", /^\/teaching\/learners\/\d+\/award$/, guidance.awardPaperFunds],
  ["POST", /^\/assignments$/, task.createAssignment],
  ["POST", /^\/milestones$/, task.createMilestone],
  ["PUT", /^\/learning-plans\/\d+$/, task.saveLearningPlan],
  ["POST", /^\/assignments\/\d+\/submit$/, task.submitAssignment],
  ["POST", /^\/submissions\/\d+\/review$/, task.reviewSubmission],
  ["POST", /^\/milestones\/\d+\/state$/, task.updateMilestone],
  ["POST", /^\/payments$/, payment.createPayment],
  ["POST", /^\/payments\/\d+\/demo$/, payment.confirmDemoPayment],
  ["POST", /^\/payments\/\d+\/reconcile$/, payment.reconcilePayment],
  ["POST", /^\/payments\/\d+\/discard-demo$/, payment.discardDemoPayment],
  ["POST", /^\/plans\/\d+\/end-renewal$/, payment.endRenewal],
  ["POST", /^\/admin\/payments\/\d+\/refund$/, payment.requestRefund],
  ["POST", /^\/commerce\/\d+\/decision$/, commerce.decideProposal],
  ["POST", /^\/commerce\/\d+\/earning$/, commerce.recordProviderEarning],
  ["POST", /^\/settlements\/\d+\/paid$/, commerce.recordProviderSettlement],
  [
    "POST",
    /^\/notifications\/read-all$/,
    notification.markAllNotificationsRead,
  ],
  ["POST", /^\/notifications\/\d+\/read$/, notification.markNotificationRead],
  ["POST", /^\/notifications\/\d+\/open$/, notification.openNotification],
  ["POST", /^\/admin\/notifications$/, notification.broadcastNotification],
  ["POST", /^\/support$/, support.createSupportTicket],
  ["POST", /^\/support\/\d+\/reply$/, support.replyToTicket],
  ["POST", /^\/support\/\d+\/close$/, support.closeTicket],
];
export function writerFor(path, method = "POST") {
  const thunk = writes.find(
    ([verb, pattern]) => verb === method && pattern.test(path),
  )?.[2];
  if (!thunk) throw new Error("Unmapped API operation: " + method + " " + path);
  return thunk;
}
export function affectedDomains(path) {
  const domain = domainFor(path);
  const related = {
    auth: ["auth", "user"],
    user: ["user", "auth", "guidance"],
    trading: ["trading", "portfolio"],
    portfolio: ["portfolio"],
    watchlist: ["watchlist"],
    course: ["course", "commerce", "resource", "quiz"],
    resource: ["resource"],
    quiz: ["quiz", "course", "task"],
    guidance: ["guidance", "task", "user", "portfolio"],
    task: ["task", "guidance"],
    payment: ["payment", "auth", "portfolio", "course", "guidance"],
    commerce: ["commerce", "course"],
    notification: ["notification"],
    support: ["support"],
  };
  return [
    ...new Set([...(related[domain] || [domain]), "notification", "dashboard"]),
  ];
}
