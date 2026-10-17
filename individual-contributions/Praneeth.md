# Individual contribution — Praneeth

| Field | Value |
|---|---|
| Name | Praneeth |
| Roll number | S20240010179 |
| Project | IndAI — Financial Literacy and Paper Trading |
| Primary actor(s) | Instructor |
| Additional integration | Shared profile, theme and interaction components |

## Responsibility

Instructor portal, teaching workflows and shared account UI. This record defines the member's technical responsibility within the integrated application.

### Instructor management

Assigned learner visibility, instructor-owned assignment creation/review, scheduled sessions and performance/earnings views.

### Communication

Selected/all-assigned active learner notification composer and learner receipt integration.

### Shared account interaction

Profile editing/password-change integration, theme persistence and shared form/modal behavior across portals.

## Frontend implementation scope

| Exact source path | Components/functions | Responsibility boundary |
|---|---|---|
| `frontend/src/layouts/InstructorDashboard.jsx` | `InstructorDashboard` | Instructor portal layout and views. |
| `frontend/src/components/Management.jsx` | `Assignments`, `Sessions` | Instructor assignment, submission approval and session controls. |
| `frontend/src/components/NotificationComposer.jsx` | `NotificationComposer` | Recipient selection, message state and successful-send callback. |
| `frontend/src/pages/Dashboard.jsx` | `Dashboard`, `NotificationList` | Instructor analytics/composition and shared account/profile integration. |
| `frontend/src/components/ThemeToggle.jsx` | `ThemeToggle` | Persistent theme preference and storage-event cleanup. |
| `frontend/src/components/Common.jsx` | `Editor`, `Modal`, `Notice` | Shared controlled form, dialog and validation feedback integration. |
| `frontend/src/components/Commerce.jsx` | `Earnings` | Instructor earnings presentation. |

## Backend integration scope

| Exact source path | Component/service | Role in the workflow |
|---|---|---|
| `back-end/src/modules/assignments/assignments.service.ts` | `AssignmentsService` | Assignment records, submissions and one-time completion approval. |
| `back-end/src/modules/sessions/sessions.service.ts` | `SessionsService` | Saved session scheduling/update rules. |
| `back-end/src/modules/notifications/notifications.service.ts` | `NotificationsService` | Assigned active recipient selection and in-app records. |
| `back-end/src/modules/account/account.module.ts` | `AccountController` | Profile and password-change endpoints. |

## React implementation

- **Controlled teaching forms:** Assignments/Sessions compose Editor with field definitions and asynchronous submission callbacks.
- **Recipient state and filtering:** NotificationComposer receives learners/onSent, tracks all/ids/query/message, filters eligible candidates and maps checkbox rows.
- **Parent-child communication:** onSent receives the backend recipient count. notify callbacks report saved/rejected actions; onUser updates the parent profile.
- **Shared effects:** Modal manages focus/Escape/scroll cleanup. ThemeToggle synchronizes DOM/localStorage preference and removes its storage listener.
- **Validation and API actions:** Busy/recipient rules disable invalid sends; server checks assignment ownership, active learners, DTO rules and profile credentials.

## API interfaces

All endpoints use the backend /api prefix. Identifier segments are route parameters. The server applies authentication, role/division, ownership and business validation.

| Method and route | Handler |
|---|---|
| `POST /api/assignments` | `AssignmentsController.create` |
| `POST /api/assignments/:id/approve/:learnerId` | `AssignmentsController.approve` |
| `POST /api/sessions` | `SessionsController.create` |
| `POST /api/notifications/send` | `NotificationsController.send` |
| `PATCH /api/account/profile` | `AccountController.profile` |

## Integrated behavior

Instructor actions operate on assigned learners. The frontend submits a validated form or recipient selection, then reloads saved records after the backend mutation. Shared profile/theme/modal controls provide consistent interaction across all actors.

## Team coordination

Coordinates learner submission/receipt views with Jeswanth and provider-owned assignment variants with Purvaj. Shared Common and Dashboard files are coordinated at function/role boundaries with the other leads, not treated as exclusively owned files.

Shared application data is read through `frontend/src/hooks/useResource.js` and mutations use `frontend/src/services/api.js`. Form/dialog primitives in `frontend/src/components/Common.jsx` provide common value/callback/error behavior. Successful mutations refresh real backend records; UI visibility alone is not authorization.

[Project overview](../README.md) · [Team responsibilities](../docs/TEAM.md) · [Architecture](../docs/ARCHITECTURE.md)
