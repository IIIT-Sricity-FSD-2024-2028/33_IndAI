# Individual contribution — Gurwinder

| Field | Value |
|---|---|
| Name | Gurwinder |
| Roll number | S20240010082 |
| Project | IndAI — Financial Literacy and Paper Trading |
| Primary actor(s) | Super Admin, Payment Admin |
| Additional integration | Authorization, commercial administration and platform reporting |

## Responsibility

Administrative oversight, commercial review and payment integration. This record defines the member's technical responsibility within the integrated application.

### Super Admin

Actor-specific account controls, staff approvals, configuration, audit/activity and platform reporting.

### Payment Admin

Course quote/review/counter-offer/publication, revenue dashboards and instructor/provider compensation records.

### Shared service boundaries

Razorpay order/signature/webhook handling, role/division/ownership enforcement and administrative reporting integration.

## Frontend implementation scope

| Exact source path | Components/functions | Responsibility boundary |
|---|---|---|
| `frontend/src/layouts/SuperuserDashboard.jsx` | `SuperuserDashboard` | Super Admin portal layout. |
| `frontend/src/layouts/PaymentAdminDashboard.jsx` | `PaymentAdminDashboard` | Payment Admin portal layout. |
| `frontend/src/components/Management.jsx` | `UserManager`, `AccountForm`, `Approvals`, `Configuration` | Super Admin actor controls, approvals and configuration. |
| `frontend/src/components/Commerce.jsx` | `Revenue`, `InstructorPay`, `GatewayStatus` | Course sanction/revenue/compensation/gateway status presentation. |
| `frontend/src/components/PlatformReports.jsx` | `PlatformAnalytics`, `SystemActivity` | Saved platform counts, charts and administrative activity. |
| `frontend/src/services/payments.js` | `checkout` | Frontend checkout integration with verified backend activation. |

## Backend integration scope

| Exact source path | Component/service | Role in the workflow |
|---|---|---|
| `back-end/src/modules/superuser/superuser.controller.ts` | `SuperuserController` | Staff approval, oversight and audit APIs. |
| `back-end/src/modules/admin/admin.controller.ts` | `AdminController` | Configuration and instructor-assignment operations. |
| `back-end/src/modules/commercial/commercial.service.ts` | `CommercialService` | Publication, offer, revenue and compensation rules. |
| `back-end/src/modules/payments/payments.service.ts` | `PaymentsService` | Server payment verification and activation rules. |
| `back-end/src/modules/reports/reports.controller.ts` | `ReportsController` | Platform/learner/course reports. |
| `back-end/src/common/roles.guard.ts` | `RolesGuard` | Authenticated role checks. |
| `back-end/src/common/ownership.guard.ts` | `OwnershipGuard` | Resource-level mutation/identity checks. |

## React implementation

- **Actor-dependent forms:** AccountForm selects fields from actor state; changing actor remounts its controlled Editor.
- **State and callback flow:** Revenue owns review/payment-dialog state and awaits commercial mutations before refreshing resource data.
- **Conditional role views:** Super Admin and Payment Admin layouts expose their role/division operations while backend checks remain authoritative.
- **Resource-driven reports:** PlatformAnalytics/SystemActivity receive report data as props and render current saved counts/activity, rather than fixed placeholders.
- **API and payment boundary:** checkout coordinates frontend interaction with server-created payment orders. Internal compensation records are separate from bank transfers.

## API interfaces

All endpoints use the backend /api prefix. Identifier segments are route parameters. The server applies authentication, role/division, ownership and business validation.

| Method and route | Handler |
|---|---|
| `GET /api/reports/platform` | `ReportsController.platform` |
| `POST /api/superuser/approvals/:userId/approve` | `SuperuserController.approve` |
| `PATCH /api/admin/config` | `AdminController.updateConfig` |
| `POST /api/commercial/courses/:id/approve` | `CommercialController.approve` |
| `GET /api/commercial/revenue/summary` | `CommercialController.revenue` |

## Integrated behavior

Administrative forms invoke guarded Nest controllers/services. Commercial approval publishes an eligible provider course; report resources refresh the saved state. Payment activation requires backend verification rather than a client-only success callback.

## Team coordination

Coordinates User Admin account/onboarding boundaries with Bharan, provider negotiation/publication with Purvaj, learner subscription with Jeswanth, and instructor earnings/notifications with Praneeth. The two smaller administrative actors are combined to balance the actor-based allocation.

Shared application data is read through `frontend/src/hooks/useResource.js` and mutations use `frontend/src/services/api.js`. Form/dialog primitives in `frontend/src/components/Common.jsx` provide common value/callback/error behavior. Successful mutations refresh real backend records; UI visibility alone is not authorization.

[Project overview](../README.md) · [Team responsibilities](../docs/TEAM.md) · [Architecture](../docs/ARCHITECTURE.md)
