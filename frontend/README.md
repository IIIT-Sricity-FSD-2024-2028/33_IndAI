# Updated IndAI Redux frontend

This folder contains the team's updated React/Redux frontend only. No backend,
database, credentials, node_modules or generated dist output is uploaded.

## Frontend installation and build

Use Node 24+ and run from the repository root:

```powershell
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix frontend run dev
```

The dev configuration defaults to http://localhost:5173 and proxies /api to
http://127.0.0.1:3000. Build output stays in frontend/dist and is not committed.

## API compatibility boundary

This uploaded UI expects the supplied Express/session API, including GET /api/me,
cookie-authenticated responses, /api/trading/*, /api/members and the updated
course/assessment/payment contracts. The organization repository's existing
backend uses NestJS/JWT, GET /api/auth/me and wrapped responses. That backend is
intentionally unchanged by this frontend-only upload. A production build does
not establish compatibility with it; login and other domain operations require
the matching API deployment or a separately implemented adapter.

Frontend verification results are recorded in the upload summary. No real
payments or external financial transfers were performed.

## User-confirmed module contribution allocation

- Jeswanth09052007: Learner/trading, watchlists, charts, portfolio and journal.
- me-coder7: Instructor learners, guidance, assignments and quizzes.
- Purvaj-P22: Courses, lessons/resources, provider workspace and landing page.
- BharanRajP: Authentication, members, User Admin and Super Admin workflows.
- gurwinder-s24: Payment Admin, plans/checkout, commerce and shared integration.

The coordinator explicitly confirmed that all five contributed their assigned
updated modules and authorized the recorded author identities. Shared files are
staged by their relevant feature functions where practical. The integrator
prepares the upload and records the commits; push authentication is separate
from each commit's author. No existing history is rewritten or force-pushed.

## Verification performed for this upload

- Standalone frontend install and Vite production build passed.
- 15 Redux regression tests passed against this actual frontend source copy.
- Headless browser checks passed for public navigation/login form, remembered
  theme, 1440/390/320px homepage layouts and unauthenticated route protection.
- The browser used explicit API fixtures and had zero page errors. These checks
  do not claim that the unchanged NestJS backend implements the new API.
- Backend/source files outside frontend are excluded from every upload commit.

The standalone frontend installation reported zero dependency advisories at
verification time. This is not an audit of the unchanged backend dependencies.
