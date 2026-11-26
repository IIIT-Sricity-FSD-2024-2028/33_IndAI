# Individual contribution — Purvaj

| Field | Value |
|---|---|
| Name | Purvaj |
| Roll number | S20240010178 |
| Project | IndAI — Financial Literacy and Paper Trading |
| Primary actor(s) | Course Provider |
| Additional integration | Provider-facing content and assessment lifecycle |

## Responsibility

Provider portal, course authoring and assessments. This record defines the member's technical responsibility within the integrated application.

### Course lifecycle

Draft course forms, provider course list, module ordering/editing and commercial review/offer interaction.

### Lesson media

Video/PDF selection, size/type validation, upload placement, signed media access and module refresh.

### Assessments and analytics

MCQ authoring, PDF question papers, submission review/manual grading, course assignments and enrollment/completion analytics.

## Frontend implementation scope

| Exact source path | Components/functions | Responsibility boundary |
|---|---|---|
| `frontend/src/layouts/ProviderDashboard.jsx` | `ProviderDashboard` | Provider portal layout and navigation. |
| `frontend/src/components/Learning.jsx` | `Courses`, `Modules`, `Uploads`, `Quizzes`, `QuizEditor`, `LessonVideo` | Provider authoring, uploads, question editor and review controls. |
| `frontend/src/pages/Dashboard.jsx` | `ProviderAnalytics` | Course enrollment/completion analytics and provider composition. |
| `frontend/src/components/Management.jsx` | `Assignments` | Provider-owned course assignment creation/review branches. |
| `frontend/src/components/Commerce.jsx` | `Earnings` | Provider earnings display. |

## Backend integration scope

| Exact source path | Component/service | Role in the workflow |
|---|---|---|
| `back-end/src/modules/courses/courses.controller.ts` | `CoursesController` | Provider course create/update/list routes. |
| `back-end/src/modules/courses/courses.service.ts` | `CoursesService` | Course records and provider analytics data. |
| `back-end/src/modules/course-modules/course-modules.controller.ts` | `CourseModulesController` | Lesson upload, module editing and signed access. |
| `back-end/src/modules/quizzes/quizzes.controller.ts` | `QuizzesController` | MCQ/PDF quiz storage, scoring and grade operations. |
| `back-end/src/modules/commercial/commercial.service.ts` | `CommercialService` | Provider course review/offer/earnings integration. |

## React implementation

- **State and props:** Courses holds selected/edit state. Modules receives course, enrollment, notify and onProgress; QuizEditor receives initial, courses and onSubmit.
- **Controlled assessment forms:** Question text/options, correct-answer radios, format/course choices, instructions and written answers are state-driven.
- **File events and validation:** Uploads stores browser File objects after file checks and transmits FormData; PDF format conditionally changes the quiz form.
- **Side effects:** Modules scrolls/focuses the module editor when editModule changes. Quizzes reloads/reconciles review data through the resource hook.
- **Immutable rendering:** QuizEditor maps questions/options and creates new arrays/objects for edits; course/module lists render stable record IDs.

## API interfaces

All endpoints use the backend /api prefix. Identifier segments are route parameters. The server applies authentication, role/division, ownership and business validation.

| Method and route | Handler |
|---|---|
| `POST /api/courses` | `CoursesController.create` |
| `POST /api/course-modules/upload-video` | `CourseModulesController.uploadVideo` |
| `POST /api/quizzes` | `QuizzesController.create` |
| `POST /api/quizzes/:id/attempts/:attemptId/grade` | `QuizzesController.grade` |
| `POST /api/commercial/courses/:id/submit-review` | `CommercialController.submit` |

## Integrated behavior

A provider saves a draft, uploads modules and creates assessments through real Nest endpoints. Commercial review controls publication. Enrolled learners generate progress and attempts; provider analytics and grading read and update those saved records.

## Team coordination

Coordinates learner presentation and progress with Jeswanth, course publication/offer handling with Gurwinder, and shared assignment controls with Praneeth. The heavy authoring/media/assessment workload stays within this dedicated actor scope.

Shared application data is read through `frontend/src/hooks/useResource.js` and mutations use `frontend/src/services/api.js`. Form/dialog primitives in `frontend/src/components/Common.jsx` provide common value/callback/error behavior. Successful mutations refresh real backend records; UI visibility alone is not authorization.

[Project overview](../README.md) · [Team responsibilities](../docs/TEAM.md) · [Architecture](../docs/ARCHITECTURE.md)
