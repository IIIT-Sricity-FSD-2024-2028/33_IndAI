# Review–4 Coherence Fixes

This version was corrected to make the frontend, backend, RBAC, Swagger and API route naming work coherently.

## Fixed

1. Added backend Auth module:
   - `POST /api/auth/login`
   - `GET /api/auth/me/:userId`

2. Fixed role normalization:
   - `SUPER_USER` maps to `superuser`
   - `COURSE_PROVIDER` maps to `provider`
   - uppercase and lowercase role headers both work.

3. Added required Review–4 style endpoint groups:
   - `/api/market/instruments`
   - `/api/market/prices`
   - `/api/trading/orders`
   - `/api/trading/trades/learner/:learnerId`
   - `/api/portfolio/:learnerId`
   - `/api/reports/platform`
   - `/api/admin/config`
   - `/api/superuser/overview`
   - `/api/enrollments`
   - `/api/diagnostic/submit`
   - `/api/quizzes`
   - `/api/feedback`
   - `/api/courses/:courseId/modules`

4. Replaced success-false responses with proper Nest exceptions where important:
   - `400 Bad Request`
   - `403 Forbidden`
   - `404 Not Found`

5. Fixed duplicate email handling.

6. Fixed frontend login:
   - `login.html` now loads `api.js`.
   - login calls backend first.
   - fallback to Review–3 mock login remains if backend is offline.

7. Fixed frontend registration:
   - `register.html` now loads `api.js`.
   - registration calls backend first.
   - fallback to local Review–3 registration remains if backend is offline.

8. Ensured backend portfolio/trading responses do not expose passwords.

9. Verified backend build with:
   - `npm run build`

10. Verified frontend JS syntax.

## Swagger

Swagger UI is available at:

```text
http://localhost:3000/api/docs
```

Swagger JSON is generated at:

```text
back-end/docs/swagger.json
```
