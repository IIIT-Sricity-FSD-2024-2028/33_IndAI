import { money } from '../services/api';
import { Empty, Notice, Stats, Table } from './Common';
export function SystemActivity({report}) {
 return <><Notice error={report.error}/>{report.loading&&!report.data.recentActivity?<p>Loading platform events…</p>:report.data.recentActivity?.length?<div className="system-events">{report.data.recentActivity.map(a=><div className="activity-item" key={a.id}><div className="activity-dot"/><div><strong>{a.message}</strong><p>{new Date(a.at).toLocaleString()}</p></div></div>)}</div>:<Empty>No recorded activity yet. Account changes, enrollments, trades and content updates will appear here.</Empty>}</>;
}
export function PlatformAnalytics({report}) {
 const d=report.data;
 return <><Notice error={report.error}/><div className="stat-grid"><Stats items={[["Published Courses",d.publishedCourses||0,`${d.courses||0} total courses`],["Enrollments",d.enrollments||0,`${d.completions||0} completed`,"green"],["Paper Trades",d.trades||0,`${money(d.tradeVolume)} virtual turnover`,"purple"],["Quiz Attempts",d.quizAttempts||0,`${d.pendingQuizReviews||0} awaiting review`,"orange"]]}/></div><h4 className="mb-16">Activity in the last 7 days (IST)</h4><Table heads={["Date","New accounts","Enrollments","Filled trades"]} rows={(d.trend||[]).map(t=>[t.day,t.registrations,t.enrollments,t.trades])}/><p className="card-subtitle">{d.assignments||0} assignments · {d.sessions||0} scheduled sessions · {money(d.revenue)} verified subscription/licence revenue</p><p className="card-subtitle">Updated {d.generatedAt?new Date(d.generatedAt).toLocaleTimeString():'…'} · refreshes every 5 seconds</p></>;
}
