# Final Test Cases To Run Locally

Open the root folder in VS Code. The root folder must contain:

```txt
front-end/
back-end/
Videos/
DataBase/
RUN_INSTRUCTIONS.md
FINAL_MERGE_TEST_REPORT.md
```

## 1. Start backend

Where to type: VS Code Terminal 1 / PowerShell.

```powershell
cd back-end
npm install
npm run start:dev
```

Expected output:

```txt
Nest application successfully started
IndAI backend running at http://localhost:3000/api
Swagger UI: http://localhost:3000/api/docs
```

Open in browser:

```txt
http://localhost:3000/api/docs
```

Expected: Swagger UI opens.

---

## 2. Start frontend

Where to type: VS Code Terminal 2 / PowerShell.

```powershell
cd front-end
python -m http.server 5500
```

If Python command fails:

```powershell
py -m http.server 5500
```

Open in browser:

```txt
http://localhost:5500/pages/login.html
```

Expected: login page opens.

---

## 3. Backend login test

Where to type: VS Code Terminal 3 / PowerShell while backend is running.

```powershell
$body = @{
  email = "learner@indai.com"
  password = "Learn@1234"
  role = "LEARNER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
```

Expected output:

```txt
success True
```

What it proves: backend login endpoint works.

---

## 4. RBAC negative test

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role" = "LEARNER" }
```

Expected: `403 Forbidden` red error.

What it proves: learner cannot access user management.

---

## 5. RBAC positive test

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role" = "SUPER_USER" }
```

Expected: users list returned.

What it proves: Super User can access user management.

---

## 6. Lowercase role compatibility test

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role" = "superuser" }
```

Expected: users list returned.

What it proves: frontend lowercase roles and Review–4 uppercase roles both work.

---

## 7. Invalid role rejected

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role" = "hacker" }
```

Expected: `403 Forbidden`.

What it proves: arbitrary roles cannot bypass RBAC.

---

## 8. Create user

```powershell
$body = @{
  firstName = "Test"
  lastName = "Learner"
  email = "testlearner@example.com"
  password = "Test@123"
  role = "LEARNER"
  status = "active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "SUPER_USER" } -Body $body
```

Expected: new user created with an ID.

What it proves: `POST /api/users` works.

---

## 9. Duplicate email validation

Run the same create-user command again.

Expected: `400 Bad Request`, email already registered.

What it proves: duplicate data handling works.

---

## 10. Invalid user DTO validation

```powershell
$body = @{
  firstName = ""
  email = "bad-email"
  role = "LEARNER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "SUPER_USER" } -Body $body
```

Expected: `400 Bad Request`.

What it proves: DTO validation works.

---

## 11. Market instruments

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/market/instruments" -Method GET -Headers @{ "x-role" = "LEARNER" }
```

Expected: stock/instrument list returned.

---

## 12. Market prices

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/market/prices" -Method GET -Headers @{ "x-role" = "LEARNER" }
```

Expected: market tick/prices returned.

---

## 13. Buy order

```powershell
$body = @{
  learnerId = "u6"
  symbol = "TCS"
  orderType = "BUY"
  orderCategory = "MARKET"
  quantity = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/trading/orders" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "LEARNER"; "x-user-id" = "u6" } -Body $body
```

Expected: order/trade created.

What it proves: buy workflow works and portfolio updates.

---

## 14. Portfolio check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/portfolio/u6" -Method GET -Headers @{ "x-role" = "LEARNER"; "x-user-id" = "u6" }
```

Expected: portfolio, holdings, market value, and trades returned.

---

## 15. Sell more than owned validation

```powershell
$body = @{
  learnerId = "u6"
  symbol = "TCS"
  orderType = "SELL"
  orderCategory = "MARKET"
  quantity = 99999
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/trading/orders" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "LEARNER"; "x-user-id" = "u6" } -Body $body
```

Expected: `400 Bad Request`.

What it proves: learner cannot sell more shares than owned.

---

## 16. Create course

```powershell
$body = @{
  providerId = "u5"
  title = "Review4 Test Course"
  description = "Testing course creation"
  lessons = 5
  duration = "1 week"
  skillPoints = 20
  category = "Trading"
  difficulty = "BEGINNER"
  status = "published"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/courses" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "COURSE_PROVIDER"; "x-user-id" = "u5" } -Body $body
```

Expected: course created.

---

## 17. Duplicate enrollment blocked

```powershell
$body = @{
  learnerId = "u6"
  courseId = "c1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/enrollments" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "LEARNER"; "x-user-id" = "u6" } -Body $body
```

Expected: `400 Bad Request` because seed data already has enrollment `u6` → `c1`.

---

## 18. Create session

```powershell
$body = @{
  instructorId = "u3"
  title = "Test Session"
  description = "Demo session"
  date = "2026-05-10"
  time = "10:00"
  studentIds = @("u6")
  status = "scheduled"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/sessions" -Method POST -Headers @{ "Content-Type" = "application/json"; "x-role" = "INSTRUCTOR"; "x-user-id" = "u3" } -Body $body
```

Expected: session created.

---

## 19. Reports

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/platform" -Method GET -Headers @{ "x-role" = "ADMIN" }
```

Expected: platform report returned.

---

## 20. Admin config

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/config" -Method GET -Headers @{ "x-role" = "ADMIN" }
```

Expected: config returned.

---

## 21. Frontend login test

Open:

```txt
http://localhost:5500/pages/login.html
```

Use:

```txt
Role: Learner
Email: learner@indai.com
Password: Learn@1234
```

Expected: redirects to learner dashboard.

Open DevTools → Network → Fetch/XHR. Expected request:

```txt
POST /api/auth/login
```

---

## 22. Other frontend demo accounts

| Role | Email | Password | Expected redirect |
|---|---|---|---|
| Super User | superadmin@indai.com | Admin@1234 | superuser-dashboard.html |
| Admin | admin@indai.com | Admin@1234 | admin-dashboard.html |
| Instructor | instructor@indai.com | Inst@1234 | instructor-dashboard.html |
| Course Provider | provider@indai.com | Prov@1234 | provider-dashboard.html |
| Learner | learner@indai.com | Learn@1234 | learner-dashboard.html |

---

## 23. Swagger check

Open:

```txt
http://localhost:3000/api/docs
```

Check these APIs manually:

```txt
POST /api/auth/login
POST /api/users
POST /api/courses
POST /api/trading/orders
GET /api/portfolio/{learnerId}
GET /api/reports/platform
```

Expected:

```txt
Request schema visible
Response section visible
x-role header visible on protected APIs
```
