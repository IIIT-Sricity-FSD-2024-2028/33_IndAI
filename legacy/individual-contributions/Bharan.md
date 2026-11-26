# Individual contribution — Bharan

| Field | Value |
|---|---|
| Name | Bharan |
| Roll number | S20240010176 |
| Project | IndAI — Financial Literacy and Paper Trading |
| Primary actor(s) | User Admin |
| Additional integration | Public pages, authentication and registration |

## Responsibility

User onboarding and institution account administration. This record defines the member's technical responsibility within the integrated application.

### Public access

Sign-in, role-based destination selection, registration, public contact and homepage interaction.

### User Admin

Institution management, intake invitation links, roster preview/import and account administration.

### Identity integration

Authenticated API calls, active/pending account handling, role-aware onboarding and validation feedback.

## Frontend implementation scope

| Exact source path | Components/functions | Responsibility boundary |
|---|---|---|
| `frontend/src/pages/AuthPages.jsx` | `LoginPage`, `RegisterPage`, `rolePath` | Login/registration state, controlled inputs and authenticated destination selection. |
| `frontend/src/main.jsx` | `App`, `Home` | Public page selection, contact interaction and identity bootstrap integration. |
| `frontend/src/layouts/Login.jsx` | `Login` | Login form presentation and field/action callbacks. |
| `frontend/src/layouts/Register.jsx` | `Register` | Registration wizard presentation. |
| `frontend/src/layouts/UserAdminDashboard.jsx` | `UserAdminDashboard` | User Admin portal layout. |
| `frontend/src/components/Institutes.jsx` | `Institutes`, `InstituteIntake` | Institution setup, CSV intake and public roster collection. |
| `frontend/src/components/Management.jsx` | `UserManager`, `AccountForm` | User Admin account operations in shared role-aware components. |

## Backend integration scope

| Exact source path | Component/service | Role in the workflow |
|---|---|---|
| `back-end/src/modules/auth/auth.controller.ts` | `AuthController` | Login, registration, refresh, logout and authenticated identity routes. |
| `back-end/src/modules/auth/auth.service.ts` | `AuthService` | Credential verification and account/session lifecycle. |
| `back-end/src/modules/users/users.service.ts` | `UsersService` | Account creation and profile validation rules. |
| `back-end/src/modules/institutes/institutes.module.ts` | `InstitutesController` | Invitation, CSV preview/import, request retrieval and configured email delivery. |

## React implementation

- **State and controlled inputs:** LoginPage/RegisterPage own form, busy/error and wizard-step state. Layout callbacks send field values to these parent components.
- **Conditional rendering:** Registration fields and result messages depend on role, wizard step and approval status.
- **Lists and filtering:** Institution rows and roster entries are rendered from API results; shared account controls select role-specific fields.
- **Side effects:** App performs its identity lookup on dashboard startup. useResource supplies public configuration and institution-request resources with cleanup.
- **API integration:** Sign-in stores the access token through setToken; form actions await real Nest endpoints and present backend validation errors.

## API interfaces

All endpoints use the backend /api prefix. Identifier segments are route parameters. The server applies authentication, role/division, ownership and business validation.

| Method and route | Handler |
|---|---|
| `POST /api/auth/login` | `AuthController.login` |
| `POST /api/auth/register` | `AuthController.register` |
| `GET /api/auth/me` | `AuthController.me` |
| `POST /api/institutes/:id/preview` | `InstitutesController.preview` |
| `POST /api/institutes/:id/import` | `InstitutesController.importCsv` |

## Integrated behavior

A public form collects account data, the authentication API validates credentials/account status, and rolePath selects the dashboard. User Admin institution intake separates CSV preview from the import mutation; invitation delivery uses configured SMTP.

## Team coordination

Coordinates account identity/guard behavior with Gurwinder and shared profile controls with Praneeth. Account management is scoped to User Admin behavior, not exclusive ownership of the shared Management component.

Shared application data is read through `frontend/src/hooks/useResource.js` and mutations use `frontend/src/services/api.js`. Form/dialog primitives in `frontend/src/components/Common.jsx` provide common value/callback/error behavior. Successful mutations refresh real backend records; UI visibility alone is not authorization.

[Project overview](../README.md) · [Team responsibilities](../docs/TEAM.md) · [Architecture](../docs/ARCHITECTURE.md)
