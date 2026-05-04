# IndAI Review-4 Merged Final Version Report

This package was created by comparing and merging the uploaded Claude fixed version with the latest fully rectified Review-4 version.

## Merge decision

The latest fully rectified version was used as the base because it had the broader NestJS module coverage and better Review-4 alignment:

- Auth module
- Market/Trading/Portfolio alias endpoints
- Reports/Admin/Superuser endpoints
- Enrollments/Diagnostic/Quizzes/Feedback/Course Modules endpoints
- Better role normalization for both uppercase and lowercase roles
- Proper NestJS exceptions for many missing/invalid records

The Claude version contributed useful frontend API breadth and a safer duplicate stock CSV loading pattern.

## Improvements applied during merge

### Backend

1. Kept the full expanded NestJS backend from the latest rectified version.
2. Kept role normalization so these both work:
   - `SUPER_USER` / `superuser`
   - `COURSE_PROVIDER` / `provider`
   - `ADMIN` / `admin`
   - `INSTRUCTOR` / `instructor`
   - `LEARNER` / `learner`
3. Kept Review-4 endpoint aliases:
   - `/api/market/instruments`
   - `/api/market/prices`
   - `/api/trading/orders`
   - `/api/trading/trades/learner/:learnerId`
   - `/api/portfolio/:learnerId`
   - `/api/reports/platform`
   - `/api/admin/config`
   - `/api/superuser/overview`
4. Improved admin error handling:
   - invalid config body returns `400 Bad Request`
   - missing learner/instructor during assignment returns `404 Not Found`
5. Improved stock CSV loading to avoid duplicate symbol datasets overriding each other.
6. Rebuilt backend successfully with `npm run build`.
7. Runtime-tested key APIs:
   - `POST /api/auth/login` → success
   - `GET /api/users` with `x-role: SUPER_USER` → success
   - `GET /api/users` with `x-role: LEARNER` → `403 Forbidden`
   - `GET /api/market/instruments` → success
   - `POST /api/trading/orders` BUY → success
   - oversized SELL → `400 Bad Request`
   - duplicate enrollment → `400 Bad Request`
   - Swagger UI `/api/docs` → success

### Frontend

1. Kept the latest backend-integrated login/register pages.
2. Merged Claude's broader API helper ideas into the stronger current `api.js`.
3. Added generic REST helpers:
   - `get`
   - `post`
   - `patch`
   - `put`
   - `delete`
4. Added API methods for users, courses, course modules, enrollments, diagnostic, trading, portfolio, watchlists, assignments, sessions, quizzes, feedback, notifications, reports, admin, and superuser.
5. Added a compatibility `window.Api` alias for older bridge-style code.
6. Added `backendBridge.js` and linked it to all role dashboard pages.
7. Verified all frontend JS files pass syntax checks with `node --check`.

## Important run commands

### Backend

```powershell
cd back-end
npm install
npm run start:dev
```

Swagger:

```txt
http://localhost:3000/api/docs
```

### Frontend

```powershell
cd front-end
python -m http.server 5500
```

Frontend:

```txt
http://localhost:5500/pages/login.html
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super User | `superadmin@indai.com` | `Admin@1234` |
| Admin | `admin@indai.com` | `Admin@1234` |
| Instructor | `instructor@indai.com` | `Inst@1234` |
| Course Provider | `provider@indai.com` | `Prov@1234` |
| Learner | `learner@indai.com` | `Learn@1234` |

## Notes

- This is still an academic Review-4 implementation, so authentication is simulated and RBAC is based on the `x-role` header as required.
- No external database is used.
- In-memory data resets when the backend restarts.
