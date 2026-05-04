# Backend Validation Audit — Review–4

Project: Education-Oriented Financial Literacy and Paper Trading Platform  
Scope: Scan Review–3 frontend validation and align NestJS backend DTO/service validation without redesigning UI.

## Frontend Validation Sources Inspected

- `front-end/js/utils/validation.js`
- `front-end/js/utils/auth.js`
- `front-end/js/utils/permissions.js`
- `front-end/js/utils/backendBridge.js`
- `front-end/js/utils/api.js`
- `front-end/pages/register.html`
- `front-end/js/modules/admin.js`
- `front-end/js/modules/superuser.js`
- `front-end/js/modules/provider.js`
- `front-end/js/modules/instructor.js`
- `front-end/js/modules/learner.js`
- `front-end/js/modules/trading.js`
- `front-end/js/components/modals.js`

## Validation Audit Table

| Frontend file / form | Field | Frontend validation found | Backend DTO/service currently had it? | Required backend fix | Priority |
|---|---|---|---|---|---|
| `pages/register.html`, `utils/validation.js` | firstName, lastName | Required, min 3, alphabets/spaces only | Partial | Added `@IsNotEmpty`, `@MinLength(3)`, `@Matches(NAME_REGEX)` to `CreateUserDto`/`UpdateUserDto` | High |
| `pages/register.html`, `utils/validation.js` | email | Required, Gmail or `.in` email for registration | Partial | Added frontend-matching email regex to `CreateUserDto`; login uses valid email format to preserve seeded `@indai.com` demo accounts | High |
| `utils/auth.js` | duplicate email | Block duplicate email | Partial / 400 | Added `ConflictException` 409 in `UsersService.create` and update duplicate check | High |
| `pages/register.html`, `utils/validation.js` | phone | Required in frontend registration; 10 digits, starts 6/7/8/9 | No | Added Indian phone regex validation to user DTOs | High |
| `utils/auth.js`, `components/modals.js` | password | Required, min 8, uppercase, lowercase, number, special `!@#$%^&*` | Weak min length only | Added strong password regex to `CreateUserDto` | High |
| `pages/register.html` | dateOfBirth | Required in frontend; age >= 10 | No | Added date DTO validation and service age check | High |
| `pages/register.html`, `auth.js` | role | Required enum | Partial | Added `@IsIn(USER_ROLES)` and role normalization service check | High |
| `superuser.js`, `admin.js` | status | active/pending/suspended enum | No | Added `USER_STATUSES` enum validation | Medium |
| `register.html`, `learner.js` | learner institution | min 3, cannot start with number | Partial frontend-only | Added DTO regex/min length | High |
| `register.html` | studentId | min 3; duplicate per institution | No | Added DTO min length and service 409 conflict check | High |
| `register.html` | grade / level | min 3 if provided | No | Added DTO min length | Medium |
| `register.html`, `learner.js` | course / major | min 3 if provided | No | Added DTO min length | Medium |
| `register.html`, `superuser.js` | instructor institution | required for instructor, min 3, cannot start with number | Partial frontend-only | Added service required check and DTO rules | High |
| `register.html`, `superuser.js` | instructor expertise | required, min 3 | Partial frontend-only | Added service required check and DTO min length | High |
| `register.html`, `superuser.js` | yearsExp | required for instructor | No | Added DTO/service required validation | Medium |
| `register.html`, `superuser.js` | provider organization | required, min 3, cannot start with number | Partial frontend-only | Added service required check and DTO validation | High |
| `register.html`, `superuser.js` | website | optional but valid `http://` or `https://` URL | No | Added `@IsUrl({ require_protocol: true })` | Medium |
| `register.html` | admin institution/access code/access level | institution and authorization code required | No | Added service required checks and DTO fields | Medium |
| `register.html` | trading experience, risk tolerance | select required on final step | No | Added optional enum validation fields in DTO | Medium |
| `provider.js`, `superuser.js` | course title | required/min 3 | Partial | Added `CreateCourseDto`/`UpdateCourseDto` min length | High |
| `provider.js`, `superuser.js` | course description | required/min 3 | No | Added DTO min length | High |
| `provider.js`, `superuser.js` | providerId | required and must be provider | No | Added DTO required and service existence/role check | High |
| `provider.js`, `superuser.js` | category | required/select | No | Added DTO required string | Medium |
| `provider.js`, `superuser.js` | lessons | positive int 1–200 | No | Added `@IsInt`, `@Min(1)`, `@Max(200)` | High |
| `provider.js`, `superuser.js` | skillPoints | create positive int 1–200 | Partial | Added DTO validation; update allows 0 for existing bridge compatibility | High |
| `provider.js`, `superuser.js` | course status | draft/published | No | Added course status enum | Medium |
| `provider.js` | duplicate course title | implied conflict prevention needed | No | Added service 409 duplicate title check | Medium |
| `provider.js` video/module upload | module title | required/min 3 | No | Added `CreateCourseModuleDto`/`UpdateCourseModuleDto` | Medium |
| `provider.js` | module type | valid select | No | Added module type enum | Medium |
| `provider.js` | module order | positive integer | No | Added `@IsInt`, `@Min(1)` | Medium |
| `provider.js` | material URL | optional valid URL | No | Added URL validation | Low |
| `provider.js` | duplicate module title | conflict if same course | No | Added service 409 duplicate module title | Medium |
| `trading.js`, `auth.js executeTrade` | learnerId | required, learner must exist | Partial | Service now checks user exists and role is learner | High |
| `trading.js` | symbol | required and must exist in market repository | Partial | DTO symbol regex + service stock repository existence check | High |
| `trading.js` | order type | BUY/SELL enum | Yes | Strengthened DTO message and service checks | High |
| `trading.js` | order category | MARKET/LIMIT/STOP_LOSS | Weak string only | Added enum validation | Medium |
| `trading.js` | quantity | required positive whole number | Yes | Strengthened DTO transform and message | High |
| `trading.js` | price | optional positive number | Yes | Strengthened DTO transform | Medium |
| `auth.js executeTrade` | insufficient balance | block buy if balance insufficient | Yes | Kept and tightened learner/stock checks | High |
| `auth.js executeTrade` | sell more than owned | block sell if not enough shares | Yes | Kept and tightened symbol normalization | High |
| `watchlists` bridge | duplicate watchlist symbol | prevent duplicates | Partial Set silently deduped | Changed to 409 conflict for duplicate symbol | Medium |
| `watchlists` bridge | watchlist symbol exists | must be known stock | No | Added service stock existence check | High |
| `enrollments` bridge | learnerId/courseId | required, both must exist | Partial | Added `CreateEnrollmentDto` and 404 checks | High |
| `enrollments` bridge | duplicate enrollment | block duplicate | Partial / 400 | Changed to 409 conflict | High |
| `enrollments` progress | progress | 0–100 | Clamped silently | Added `UpdateProgressDto`; invalid values now 400 | High |
| `sessions.js`, `superuser.js`, `provider.js` | session title | required/min 3 | Partial | Added `CreateSessionDto`/`UpdateSessionDto` | High |
| `sessions.js` | instructorId | required and instructor must exist | No | Added DTO and service role check | High |
| `sessions.js` | date | required, future, within 365 days | Partial title only | Added service date validation | High |
| `sessions.js` | time | required HH:mm | No | Added DTO regex | Medium |
| `sessions.js` | duration | 15–480 minutes | No | Added DTO numeric validation | Medium |
| `sessions.js` | studentIds | valid learner array | No | Added service existence checks | Medium |
| `assignments.js`, `superuser.js`, `provider.js` | title/description | required/min 3 | Partial title only | Added DTO min length and service trim | High |
| `assignments.js` | instructorId | required and instructor exists | No | Added service role check | High |
| `assignments.js` | dueDate | required future within 365 days | No | Added service date validation | High |
| `assignments.js` | skillPoints | positive int; frontend range 1–100/200 | Partial | Added DTO validation 1–200 | High |
| `assignments.js` | difficulty/status | enum validation | No | Added enum validation | Medium |
| `assignments.js` | submit assignment | learnerId required; duplicate submission blocked | Partial | Added `SubmitAssignmentDto`, 404 learner check, 409 duplicate submit | High |
| `quizzes.js`, `provider.js` | quiz title | required/min 3 | Partial | Added DTO min length | Medium |
| `quizzes.js` | question/options/correct answer | question required, options required, answer must match one option | Partial/no answer validation | Added service validation when question objects are sent | High |
| `quizzes.js` | question count | 1–50 | No | Added DTO `questionCount` and compatibility for frontend numeric `questions` | Medium |
| `diagnostic.controller` frontend requirement | diagnostic score | 0–100; 0–40 Beginner, 41–75 Intermediate, 76–100 Advanced | Clamped silently | Added DTO 0–100 validation; kept categorization | High |
| `feedback.js` | instructorId/learnerId | required and users exist | Partial learner only | Added DTO and service role/existence checks | High |
| `feedback.js` | message | required/min length | Partial | Added min 3 validation | Medium |
| `feedback.js` | rating | 1–5 | No | Added DTO rating range | Medium |
| `notifications.js`, provider reminders | userId/message/type/read | required user/message, type enum, read boolean | Partial | Added DTOs and service user existence check | Medium |
| `admin.js`, `superuser.js` | config numbers | required numeric positive values | Weak any object | Added `UpdateConfigDto` numeric/boolean/string validation | High |
| `admin.js` | assign instructor | learner and instructor must exist and have correct roles | Yes | Added DTO request body schema and kept 404 checks | Medium |
| `main.ts` | global validation | whitelist and transform | Missing `forbidNonWhitelisted` | Added `forbidNonWhitelisted: true` | High |

## Backend Files Changed

- `back-end/src/main.ts`
- `back-end/src/common/validation.constants.ts`
- `back-end/src/modules/auth/dto.ts`
- `back-end/src/modules/users/dto.ts`
- `back-end/src/modules/users/users.service.ts`
- `back-end/src/modules/courses/dto.ts`
- `back-end/src/modules/courses/courses.controller.ts`
- `back-end/src/modules/courses/courses.service.ts`
- `back-end/src/modules/course-modules/dto.ts`
- `back-end/src/modules/course-modules/course-modules.controller.ts`
- `back-end/src/modules/trades/dto.ts`
- `back-end/src/modules/trades/trades.service.ts`
- `back-end/src/modules/watchlists/dto.ts`
- `back-end/src/modules/watchlists/watchlists.controller.ts`
- `back-end/src/modules/watchlists/watchlists.service.ts`
- `back-end/src/modules/enrollments/dto.ts`
- `back-end/src/modules/enrollments/enrollments.controller.ts`
- `back-end/src/modules/assignments/dto.ts`
- `back-end/src/modules/assignments/assignments.controller.ts`
- `back-end/src/modules/assignments/assignments.service.ts`
- `back-end/src/modules/sessions/dto.ts`
- `back-end/src/modules/sessions/sessions.controller.ts`
- `back-end/src/modules/sessions/sessions.service.ts`
- `back-end/src/modules/quizzes/dto.ts`
- `back-end/src/modules/quizzes/quizzes.controller.ts`
- `back-end/src/modules/diagnostic/dto.ts`
- `back-end/src/modules/diagnostic/diagnostic.controller.ts`
- `back-end/src/modules/feedback/dto.ts`
- `back-end/src/modules/feedback/feedback.controller.ts`
- `back-end/src/modules/notifications/dto.ts`
- `back-end/src/modules/notifications/notifications.controller.ts`
- `back-end/src/modules/notifications/notifications.service.ts`
- `back-end/src/modules/admin/dto.ts`
- `back-end/src/modules/admin/admin.controller.ts`
- `back-end/docs/swagger.json`

## Important Compatibility Notes

- Frontend UI/UX was not redesigned.
- Frontend validation was not removed.
- No database/JWT/framework was added.
- Login DTO intentionally accepts normal email format because the seeded demo users use `@indai.com`; registration/create-user still uses frontend Review–3 rule: Gmail or `.in` email.
- `forbidNonWhitelisted: true` is enabled, so backend now rejects unexpected request body fields.
