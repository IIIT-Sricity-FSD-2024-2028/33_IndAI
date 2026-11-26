# API routes

The API is served from `/api`. Protected routes use the HttpOnly session cookie. State-changing application requests require `X-IndAI-Request: 1` with an allowed origin. The Razorpay webhook uses the signed raw body. Monetary amounts are integer paise. Timestamps are epoch milliseconds except for chart intervals, which use day strings or epoch seconds. List endpoints accept a zero-based page parameter where supported.

| Area | Routes and inputs |
| --- | --- |
| Session | `GET /config`, `GET /me`, `POST /auth/register` (name, email, password, confirmation), `/auth/resend` (email, password), `/auth/verify` (email, code), `/auth/login` (email, password, optional mfa), `/auth/logout`, `/auth/recovery` (email), `/auth/reset` (email, code, password, confirmation) |
| Applications | `POST /applications` (resubmit), `POST /admin/applications/:id` (decision and optional approval note or required rejection reason) |
| Administration | `GET /admin?queue=users&search=&page=0` also accepts staff, courses, payments, support, and audit depending on role. `POST /admin/staff/:id/decision` (decision, reason), `POST /admin/users/:id/suspend` (reason). |
| Guidance | `GET /staff?kind=instructor` or provider, `GET /guidance`, `POST /guidance` (kind, staff, goal), `POST /guidance/:id/decision` (action, optional reason) |
| Billing | `GET /plans`, `POST /payments` (plan, provider), `POST /payments/:id/demo`, `/payments/:id/discard-demo`, `/payments/:id/reconcile` (optional payment/signature pair), `/payments/webhook`, `/admin/payments/:id/refund` (reason) |
| Courses | `GET /courses`, `GET /courses/:id`, `POST /courses`, `PUT /courses/:id` (title, description, outcomes, difficulty, prerequisites, policy), `POST /courses/:id/lessons` (module, title, body), `/courses/:id/submit`, `/courses/:id/review` (action, optional reason), `/courses/:id/enroll`, `/courses/:id/lessons/:lesson/complete` |
| Tasks | `GET /tasks`, `POST /assignments` or `/milestones` (relationship, title, body, due), `PUT /learning-plans/:id` (title, body), `POST /assignments/:id/submit` (body), `/submissions/:id/review` (feedback), `/milestones/:id/state` (state) |
| Market catalogue and quotes | `GET /trading/catalog` returns full metadata, count and snapshot time; `GET /trading/quotes?symbols=` accepts 1–500 comma-separated URL-encoded symbols and returns only their quotes. |
| Market | `GET /trading/instruments?q=`, `/trading/instruments/:symbol`, `/trading/instruments/:symbol/candles?range=1D` |
| Paper account | `GET /trading/account`, `/trading/ledger`, `/trading/orders?working=true`, `POST /trading/orders` (symbol, clientKey UUID, side, type, qty, validity, optional price, trigger, sl, tp), `/trading/orders/:id/cancel`, `/trading/reset` (confirm) |
| Watchlists and journal | `GET /trading/watchlists`, `POST /trading/watchlists` (name), `PUT /trading/watchlists/:id` (name, symbols in order), `DELETE /trading/watchlists/:id`, `GET /trading/journal`, `POST /trading/journal` (tag, body, optional order) |
| Notifications | `GET /notifications`, `POST /notifications/:id/read` |
| Support | `GET /support`, `POST /support` (subject, body), `GET /support/:id`, `POST /support/:id/reply` (body), `POST /support/:id/close` |
| Operations | `GET /health`, `GET /ready` |

Errors contain code, message, requestId, and optional fields. Each request also receives an X-Request-ID header.

## Member, resource, quiz, and provider endpoints

| Area | Routes |
| --- | --- |
| Members | GET /members with search, role, status, and page; GET /members/:id with page; POST /members to create pending staff; PUT /members/:id/profile; POST /members/:id/status, /permissions, /revoke-sessions, /reset-password, /notes |
| Instructor roster and funding | GET /guidance/active; GET /teaching/learners; POST /teaching/learners/:id/award with submission, amount in paise, and reason |
| Resources | GET /resources/:kind/:id; POST /resources/:kind/:id/upload with the binary body, Content-Type, and URI-encoded X-File-Name; GET /resource-files/:id with optional byte Range; DELETE /resource-files/:id |
| Quizzes | GET /quizzes and /quizzes/:id; POST /quizzes with title, description, scope, due, and questions; PUT /quizzes/:id for draft edits; POST /quizzes/:id/publish and /archive; PUT /quizzes/:id/draft with answers keyed by question ID; POST /quizzes/:id/submit; GET /quizzes/:id/attempts; POST /quiz-attempts/:id/grade |
| Providers | GET /provider; GET and POST /courses/:id/terms; POST /courses/:id/terms/respond |
| Commerce | GET /commerce; POST /commerce/:id/decision; POST /commerce/:id/earning; POST /settlements/:id/paid with a completed external transfer reference |

Resource kinds are course, lesson, assignment, submission, and quiz. Each target independently authorizes access. Uploads accept PDF, MP4, and WebM up to 100 MB and ten resources per target. A resource URL identifies an authorized link, and possession of the URL grants no access by itself.

Quiz question types are mcq, short, and long. MCQs carry distinct options and a zero-based correct option index in author requests. Student views exclude correct answers before final grading. Every question carries a points value and required flag. Course providers choose an owned course as scope. Instructors may choose an owned course, an assignment, or an explicit list of active learners. Final submission is unique per learner and quiz.

The member permissions route requires Super Admin and records a reason. Admin can view all roles and manage ordinary accounts. Funding awards require a current instructor relationship, reviewed submission evidence, and the rolling weekly allowance.


When the exchange is closed, Upstox quotes can include mode=replay, status=replay, recordedTime, replayDay, replayIndex, replayCount, replayCycle and replayBar. time remains the current refresh timestamp. Intraday candle responses use the visible prefix of that stock's recorded session. Orders expose feed_mode and replay_day; these are server-controlled and are not accepted as client order fields. Replay sessions never execute live orders or orders from another recorded day.
