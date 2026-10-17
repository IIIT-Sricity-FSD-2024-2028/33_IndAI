# API overview

The backend applies the `/api` prefix. Swagger UI is available at http://localhost:3000/api/docs while the server is running. Controllers define HTTP routes and DTOs; services and selected controllers implement business rules. Some modules intentionally keep their business logic in the controller file.

## Identity and request handling

The React api helper adds the Bearer access token and includes credentials. JSON requests use application/json; FormData uploads let the browser select the multipart boundary. AuthController attaches the refresh token as an HttpOnly cookie.

Global JwtAuthGuard, RolesGuard and OwnershipGuard are registered in AppModule. Division-specific rules such as User Admin intake or Payment Admin commercial operations are also applied in controllers/services. A caller-selected user ID is not proof of identity or permission. The global ValidationPipe transforms values, whitelists DTO properties and rejects unexpected properties.

Successful responses generally use success/data envelopes. Rejected requests expose errors to the React helper, which throws a message used by form/notice state. Successful platform mutations pass through PersistenceInterceptor; virtual accounts also persist in their own engine store.

## Primary actor interfaces

| Method and route template | Handler | Actor integration |
|---|---|---|
| `POST /api/auth/login` | `AuthController.login` | User Admin / Public pages, authentication and registration |
| `POST /api/auth/register` | `AuthController.register` | User Admin / Public pages, authentication and registration |
| `GET /api/auth/me` | `AuthController.me` | User Admin / Public pages, authentication and registration |
| `POST /api/institutes/:id/preview` | `InstitutesController.preview` | User Admin / Public pages, authentication and registration |
| `POST /api/institutes/:id/import` | `InstitutesController.importCsv` | User Admin / Public pages, authentication and registration |
| `POST /api/algo/orders` | `AlgoController.route` | Learner / Learner-facing trading and learning integration |
| `GET /api/algo/portfolio` | `AlgoController.route` | Learner / Learner-facing trading and learning integration |
| `POST /api/watchlists/:userId/items` | `WatchlistsController.addItem` | Learner / Learner-facing trading and learning integration |
| `POST /api/enrollments` | `EnrollmentsController.create` | Learner / Learner-facing trading and learning integration |
| `PATCH /api/enrollments/:id/progress` | `EnrollmentsController.update` | Learner / Learner-facing trading and learning integration |
| `POST /api/courses` | `CoursesController.create` | Course Provider / Provider-facing content and assessment lifecycle |
| `POST /api/course-modules/upload-video` | `CourseModulesController.uploadVideo` | Course Provider / Provider-facing content and assessment lifecycle |
| `POST /api/quizzes` | `QuizzesController.create` | Course Provider / Provider-facing content and assessment lifecycle |
| `POST /api/quizzes/:id/attempts/:attemptId/grade` | `QuizzesController.grade` | Course Provider / Provider-facing content and assessment lifecycle |
| `POST /api/commercial/courses/:id/submit-review` | `CommercialController.submit` | Course Provider / Provider-facing content and assessment lifecycle |
| `POST /api/assignments` | `AssignmentsController.create` | Instructor / Shared profile, theme and interaction components |
| `POST /api/assignments/:id/approve/:learnerId` | `AssignmentsController.approve` | Instructor / Shared profile, theme and interaction components |
| `POST /api/sessions` | `SessionsController.create` | Instructor / Shared profile, theme and interaction components |
| `POST /api/notifications/send` | `NotificationsController.send` | Instructor / Shared profile, theme and interaction components |
| `PATCH /api/account/profile` | `AccountController.profile` | Instructor / Shared profile, theme and interaction components |
| `GET /api/reports/platform` | `ReportsController.platform` | Super Admin, Payment Admin / Authorization, commercial administration and platform reporting |
| `POST /api/superuser/approvals/:userId/approve` | `SuperuserController.approve` | Super Admin, Payment Admin / Authorization, commercial administration and platform reporting |
| `PATCH /api/admin/config` | `AdminController.updateConfig` | Super Admin, Payment Admin / Authorization, commercial administration and platform reporting |
| `POST /api/commercial/courses/:id/approve` | `CommercialController.approve` | Super Admin, Payment Admin / Authorization, commercial administration and platform reporting |
| `GET /api/commercial/revenue/summary` | `CommercialController.revenue` | Super Admin, Payment Admin / Authorization, commercial administration and platform reporting |

## Learning and media routes

| Method and route | Purpose |
|---|---|
| GET /api/courses | Course records available through authenticated course APIs |
| GET /api/courses/:courseId/modules | Present permitted lesson records/signed access links |
| POST /api/courses/:courseId/modules | Add a course module |
| PATCH /api/course-modules/:id | Edit lesson metadata |
| POST /api/course-modules/upload-pdf | Upload a PDF lesson |
| POST /api/quizzes/upload-pdf | Create/update a PDF question paper |
| POST /api/quizzes/:id/submit | Submit MCQ indexes or written PDF answers |
| GET /api/notifications/user/:userId | Saved user notifications |
| POST /api/assignments/:id/submit | Learner assignment submission |

CourseModulesController is in back-end/src/modules/course-modules/course-modules.controller.ts; QuizzesController is in back-end/src/modules/quizzes/quizzes.controller.ts. Learner presentation strips MCQ correct-answer fields; written PDF answers are manually graded. Publication, enrollment, tier and ownership checks apply to the relevant course actions.

Signed upload URLs expire and require reopening content to renew access. Bare upload URLs are rejected. Video/PDF transport support does not guarantee an arbitrary codec or malformed PDF will render in the browser.

## Virtual trading

AlgoController in back-end/src/modules/algo/algo.module.ts uses an authenticated wildcard route and delegates to routes in back-end/algo/server.mjs within a per-user context. This keeps manual orders, account state, quotes/history and portfolio valuation aligned with the verified identity. The engine is a virtual-account simulator; it does not execute broker orders.

## Provider integrations

Razorpay order/signature/capture/webhook handling is implemented in the payment module. Account activation depends on verified backend data. Upstox is an optional read-only market-data provider. SMTP delivery is used for configured institution mail; the in-app notification API is a different workflow.

Use Swagger and the actual DTO/controller source for complete parameters and role restrictions. Never include access tokens, JWT secrets or payment/mail private keys in public API examples.
