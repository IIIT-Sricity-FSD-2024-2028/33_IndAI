# Architecture and React implementation

## Application composition

`frontend/src/main.jsx` mounts React using createRoot. App classifies location.pathname and renders LoginPage, RegisterPage, Dashboard, Home or InstituteIntake. Dashboard composes the appropriate actor layout and feature components. Navigation uses browser locations and tab state rather than React Router.

`back-end/src/main.ts` creates Nest, applies the /api prefix and a transforming/whitelisting ValidationPipe, exposes Swagger at /api/docs and serves the React production build. The development Vite configuration proxies /api and /uploads to port 3000. Startup scripts use local dependencies and establish the backend working directory.

## Components, props and callbacks

| Component / function | Source | Data and communication |
|---|---|---|
| App / Home | `frontend/src/main.jsx` | App owns user readiness; Home owns public form, FAQ and mobile-menu state |
| LoginPage / RegisterPage / rolePath | `frontend/src/pages/AuthPages.jsx` | Credential/wizard state; layout onField/onAction callbacks; authenticated role destination |
| Dashboard | `frontend/src/pages/Dashboard.jsx` | Receives user/onUser, owns tabs/dialogs/notices, composes actor resources and views |
| Card / Editor / Modal | `frontend/src/components/Common.jsx` | Card renders title/actions/children; Editor accepts fields/initial/onSubmit/submit; Modal accepts title/children/onClose |
| TradingWorkspace / PriceChart | `frontend/src/components/TradingWorkspace.jsx` | User/instrument/order state; candles passed to an SVG renderer |
| Courses / Modules / Quizzes / Uploads / QuizEditor | `frontend/src/components/Learning.jsx` | Course/content/assessment forms; module completion reports upward through onProgress |
| UserManager / AccountForm / Assignments / Sessions | `frontend/src/components/Management.jsx` | Shared actor-dependent management forms and callbacks |
| NotificationComposer | `frontend/src/components/NotificationComposer.jsx` | Receives learners/onSent; owns recipient/message state |
| Institutes / InstituteIntake | `frontend/src/components/Institutes.jsx` | Institution/CSV/intake forms and resource-driven request review |
| Revenue / Earnings / Subscription | `frontend/src/components/Commerce.jsx` | Commercial review/compensation/subscription resources and actions |
| PlatformAnalytics / SystemActivity | `frontend/src/components/PlatformReports.jsx` | Receive report data for current platform figures/activity |

Props supply inputs; function props communicate completed actions/data upward. Shared files contain actor-specific branches, so module boundaries are defined by component/function and role behavior.

## State, forms and events

React useState stores field values, selected items, tabs, dialogs, busy/error state and derived interaction choices. Inputs use value/onChange or checked/onChange. Editor converts configured numeric fields; trading also explicitly converts and validates quantity. File inputs supply browser File objects, retained for FormData without controlling the input value.

Handlers prevent normal form navigation, validate immediate constraints, await authenticated mutations and display actual backend errors. Record lists use map; role/search/access subsets use filter. JSX conditionals select actor controls, assessment formats, enrolled/locked content and pending-order actions. Chart renderers use SVG rather than an external chart package.

## Resource side effects

`frontend/src/hooks/useResource.js` owns data/error/loading/version state. Its effect depends on path/version/poll, loads API data, listens for mutation/focus/visibility events and polls while visible. Cleanup removes listeners/timers and marks results inactive. The active flag suppresses obsolete updates; it does not cancel HTTP through AbortController.

`frontend/src/services/api.js` handles JSON/FormData, attaches the in-memory/sessionStorage access token and sends credentials. Successful non-auth mutations broadcast indai:data-changed. Qualifying non-auth 401 responses share a refresh promise before retrying; auth paths are excluded. Dashboard startup directly calls /auth/me, so an expired access token at startup can require sign-in again.

Modules uses an effect/ref to scroll and focus its editor after selection. Modal uses effects for Escape/focus/scroll cleanup. ThemeToggle synchronizes document appearance/localStorage and removes its cross-tab storage listener on unmount. No frontend Redux store or React Context provider is configured.

## Identity and authorization

AuthController/AuthService validate credentials/account status and issue HS256 access/refresh tokens through JwtTokenService. Passwords use salted scrypt in the password helper. Refresh sessions store token hashes and support rotation. Access tokens are exposed to the frontend through sessionStorage; refresh tokens are attached as HttpOnly cookies.

AppModule registers JwtAuthGuard, RolesGuard and OwnershipGuard globally. Controllers/services additionally validate division and resource-specific rules. UI visibility does not replace backend checks. Profile/password operations live in AccountController; public contact requests are recorded as audit entries, not automatically sent by email.

## Persistence and trading

DataStore stores platform state in JSON; successful platform mutations pass through PersistenceInterceptor. The virtual engine in back-end/algo uses AsyncLocalStorage to isolate an authenticated user context and stores per-user account JSON. Backend AsyncLocalStorage is unrelated to React Context.

AlgoController binds engine operations to req.user.id. Manual orders and valuations update server-owned account state. Portfolio value is cash plus marked holdings; recorded history reflects saved snapshots. Watchlist display quotes use the bundled feed, while Trading labels its synthetic or configured market-data source.

## Learning and administration

Provider content is drafted and commercially published before learner enrollment. Module access, course tier and enrollment are validated on the server. Saved completion/assessment results supply progress and analytics. MCQs are scored on the backend; PDF written answers are reviewed and graded manually. Media uses expiring signed links.

Instructor assignments/sessions and notification recipients are scoped to their permitted learners. Institution intake separates CSV preview from validated import. User Admin and Payment Admin are administrative divisions, while Super Admin has platform-wide controls. Compensation entries are internal records; real payment activation requires verified provider data.
