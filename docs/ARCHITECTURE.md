# Runtime architecture

React 19 mounts in `frontend/src/main.jsx`. React Router handles routes; Redux
Toolkit slices and async thunks own application/server state. React Redux binds
components to the store. React Hook Form validates forms. The shared transport
`frontend/src/hooks/request.js` sends same-origin cookies, first-party mutation
headers and JSON or raw binary media bodies. It expects unwrapped API responses.

`back-end/app.js` composes Express middleware and route modules. Middleware adds
request IDs/security headers, resolves opaque cookie sessions from SQLite, checks
mutation origins/headers, audits changes and returns consistent JSON errors.
The Razorpay webhook is registered before JSON parsing to verify the raw body.
`back-end/services/access.js` centralizes role, approval and subscription rules.
Each route additionally checks ownership and contextual access.

`back-end/db.js` opens SQLite with foreign keys and WAL and applies numbered
migrations. `seed.js` creates isolated local-demo fixtures or bootstrap staff.
`server.js` hosts the API/SPA and runs paper orders, subscription reminders,
guidance reconciliation and expiry/session cleanup. Integer paise and database
transactions protect financial state. This is paper trading, not live execution.

`scripts/dev.js` starts the watched API and Vite. Root workspaces provide one
dependency installation; root `.env` sets ports/origins and runtime configuration.
Production uses the same Express process to serve frontend/dist and the API.

Old NestJS/JWT modules remain historical source only; see `legacy/README.md`.
The old Bearer-token/sessionStorage contract is not the active frontend contract.
Admin permissions are unified in this supplied version, and old institution and
session-scheduling features do not all have direct new equivalents.
