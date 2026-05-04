# Backend Validation Test Cases — Review–4

Base URL:

```bash
http://localhost:3000/api
```

Run backend:

```bash
cd back-end
npm install
npm run start:dev
```

Swagger:

```bash
http://localhost:3000/api/docs
```

Common protected API header:

```http
x-role: learner
Content-Type: application/json
```

For admin/provider/instructor APIs, change `x-role` accordingly.

---

## Build / Startup

### Test 1 — TypeScript validation/build

Command:

```bash
cd back-end
npm run build
```

Expected:

```text
No TypeScript errors. Dist folder generated.
```

Also confirm server boot:

```bash
node dist/main.js
```

Expected:

```text
Nest application successfully started
Swagger UI: http://localhost:3000/api/docs
Swagger JSON generated at back-end/docs/swagger.json
```

---

## Auth / Login

### Test 2 — Valid learner login

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "learner@indai.com",
  "password": "Learn@1234",
  "role": "LEARNER"
}
```

Expected status: `201 Created`  
Expected message/data: `success: true`, session contains learner role.

### Test 3 — Invalid login email format

Body:

```json
{
  "email": "bad-email",
  "password": "Learn@1234",
  "role": "LEARNER"
}
```

Expected status: `400 Bad Request`  
Expected message: `Enter a valid email address.`

### Test 4 — Wrong password

Body:

```json
{
  "email": "learner@indai.com",
  "password": "wrong",
  "role": "LEARNER"
}
```

Expected status: `401 Unauthorized`  
Expected message: `Invalid email or password.`

---

## Users / Registration

### Test 5 — Valid learner registration

Endpoint:

```http
POST /api/users/register
```

Body:

```json
{
  "firstName": "John",
  "lastName": "Learner",
  "email": "johnlearner@gmail.com",
  "password": "Strong@123",
  "role": "learner",
  "phone": "9876543210",
  "institution": "IIIT Sri City",
  "studentId": "CSE2026",
  "grade": "BTech 2nd Year",
  "major": "Computer Science",
  "dateOfBirth": "2007-05-09",
  "riskTolerance": "Medium",
  "tradingExperience": "Beginner"
}
```

Expected status: `201 Created`  
Expected message/data: user created; password not returned.

### Test 6 — Invalid name, email, password

Body:

```json
{
  "firstName": "Jo",
  "lastName": "3",
  "email": "x@yahoo.com",
  "password": "weak",
  "role": "learner"
}
```

Expected status: `400 Bad Request`  
Expected messages include:

```text
First name must be at least 3 characters.
Last name can contain only alphabets and spaces.
Use a Gmail address or an email ending in .in.
Password must be at least 8 characters and include uppercase, lowercase, number and special character.
```

### Test 7 — Invalid phone

Body:

```json
{
  "firstName": "John",
  "lastName": "Learner",
  "email": "johnphone@gmail.com",
  "password": "Strong@123",
  "role": "learner",
  "phone": "12345"
}
```

Expected status: `400 Bad Request`  
Expected message: `Enter a valid 10-digit Indian mobile number.`

### Test 8 — Duplicate email

First create:

```json
{
  "firstName": "Duplicate",
  "lastName": "User",
  "email": "duplicateuser@gmail.com",
  "password": "Strong@123",
  "role": "learner",
  "phone": "9876543211"
}
```

Then send same body again.

Expected status: `409 Conflict`  
Expected message: `Email already registered.`

### Test 9 — Instructor missing required role-specific fields

Body:

```json
{
  "firstName": "Amit",
  "lastName": "Teacher",
  "email": "amitteacher@gmail.com",
  "password": "Strong@123",
  "role": "instructor"
}
```

Expected status: `400 Bad Request`  
Expected message: instructor institution/expertise/years experience required.

### Test 10 — Invalid provider website

Body:

```json
{
  "firstName": "Course",
  "lastName": "Provider",
  "email": "providernew@gmail.com",
  "password": "Strong@123",
  "role": "provider",
  "organization": "Finance Academy",
  "website": "www.example.com"
}
```

Expected status: `400 Bad Request`  
Expected message: website must start with `http://` or `https://`.

---

## RBAC

### Test 11 — Missing role header on protected API

Endpoint:

```http
GET /api/stocks
```

Headers: no `x-role`.

Expected status: `403 Forbidden`  
Expected message: forbidden/role denied.

### Test 12 — Wrong role for create order

Endpoint:

```http
POST /api/trading/orders
```

Headers:

```http
x-role: admin
```

Body:

```json
{
  "learnerId": "u6",
  "symbol": "TCS",
  "orderType": "BUY",
  "quantity": 1
}
```

Expected status: `403 Forbidden`.

---

## Courses

### Test 13 — Invalid course

Endpoint:

```http
POST /api/courses
```

Headers:

```http
x-role: provider
```

Body:

```json
{
  "providerId": "u5",
  "title": "A",
  "description": "x",
  "lessons": 0,
  "skillPoints": 0,
  "category": ""
}
```

Expected status: `400 Bad Request`  
Expected messages: title/description min length, lessons min 1, skillPoints min 1, category required.

### Test 14 — Valid course

Body:

```json
{
  "providerId": "u5",
  "title": "Paper Trading Test",
  "description": "Learn paper trading safely",
  "lessons": 5,
  "duration": "2 weeks",
  "skillPoints": 20,
  "category": "Fundamentals",
  "difficulty": "BEGINNER",
  "status": "published"
}
```

Expected status: `201 Created`.

### Test 15 — Duplicate course title

Send Test 14 twice.

Expected status on second request: `409 Conflict`  
Expected message: `Course title already exists.`

---

## Course Modules

### Test 16 — Invalid module order

Endpoint:

```http
POST /api/courses/c1/modules
```

Headers:

```http
x-role: provider
```

Body:

```json
{
  "title": "Market Basics 2",
  "type": "video",
  "order": 0
}
```

Expected status: `400 Bad Request`  
Expected message: module order must be positive.

### Test 17 — Invalid material URL

Body:

```json
{
  "title": "Market Basics 2",
  "type": "video",
  "order": 3,
  "url": "example.com/video"
}
```

Expected status: `400 Bad Request`.

---

## Trading

### Test 18 — Invalid quantity

Endpoint:

```http
POST /api/trading/orders
```

Headers:

```http
x-role: learner
```

Body:

```json
{
  "learnerId": "u6",
  "symbol": "TCS",
  "orderType": "BUY",
  "quantity": 0
}
```

Expected status: `400 Bad Request`  
Expected message: `Quantity must be a positive whole number.`

### Test 19 — Unknown symbol

Body:

```json
{
  "learnerId": "u6",
  "symbol": "ZZZ",
  "orderType": "BUY",
  "quantity": 1
}
```

Expected status: `404 Not Found`  
Expected message: `Stock symbol not found.`

### Test 20 — Insufficient balance

Body:

```json
{
  "learnerId": "u6",
  "symbol": "TCS",
  "orderType": "BUY",
  "quantity": 999999
}
```

Expected status: `400 Bad Request`  
Expected message: insufficient virtual balance or trading limit exceeded.

### Test 21 — Sell more than owned

Body:

```json
{
  "learnerId": "u6",
  "symbol": "TCS",
  "orderType": "SELL",
  "quantity": 999
}
```

Expected status: `400 Bad Request`  
Expected message: `Only 0 shares available to sell.` or available share count.

---

## Watchlist

### Test 22 — Add valid watchlist symbol

Endpoint:

```http
POST /api/watchlists/u6/items
```

Headers:

```http
x-role: learner
```

Body:

```json
{
  "symbol": "TCS"
}
```

Expected status: If default watchlist already has TCS, `409 Conflict`; otherwise `201 Created`.

### Test 23 — Unknown watchlist symbol

Body:

```json
{
  "symbol": "ZZZ"
}
```

Expected status: `404 Not Found`.

---

## Enrollments / Progress

### Test 24 — Duplicate enrollment

Endpoint:

```http
POST /api/enrollments
```

Headers:

```http
x-role: learner
```

Body:

```json
{
  "learnerId": "u6",
  "courseId": "c1"
}
```

Expected status: `409 Conflict` because seed data already has `u6` enrolled in `c1`.

### Test 25 — Invalid progress

Endpoint:

```http
PATCH /api/enrollments/e1/progress
```

Body:

```json
{
  "progress": 101
}
```

Expected status: `400 Bad Request`.

### Test 26 — Valid progress

Body:

```json
{
  "progress": 80,
  "status": "in_progress"
}
```

Expected status: `200 OK`.

---

## Sessions

### Test 27 — Past session date

Endpoint:

```http
POST /api/sessions
```

Headers:

```http
x-role: instructor
```

Body:

```json
{
  "instructorId": "u3",
  "title": "Old Session",
  "date": "2025-01-01",
  "time": "10:00"
}
```

Expected status: `400 Bad Request`  
Expected message: session date must be within next 365 days.

### Test 28 — Invalid time

Body:

```json
{
  "instructorId": "u3",
  "title": "Valid Session",
  "date": "2026-05-20",
  "time": "25:99"
}
```

Expected status: `400 Bad Request`.

---

## Assignments

### Test 29 — Invalid assignment fields

Endpoint:

```http
POST /api/assignments
```

Headers:

```http
x-role: instructor
```

Body:

```json
{
  "title": "A",
  "description": "x",
  "instructorId": "u3",
  "dueDate": "2025-01-01",
  "skillPoints": 0
}
```

Expected status: `400 Bad Request`.

### Test 30 — Duplicate assignment submission

Endpoint:

```http
POST /api/assignments/a1/submit
```

Headers:

```http
x-role: learner
```

Body:

```json
{
  "learnerId": "u6",
  "submissionText": "My first submission"
}
```

Expected first status: `201 Created`  
Send again. Expected second status: `409 Conflict`.

---

## Quizzes / Diagnostic

### Test 31 — Correct answer does not match option

Endpoint:

```http
POST /api/quizzes
```

Headers:

```http
x-role: provider
```

Body:

```json
{
  "title": "Quiz Test",
  "courseId": "c1",
  "questions": [
    {
      "q": "What is paper trading?",
      "options": ["Virtual", "Real"],
      "ans": 2
    }
  ]
}
```

Expected status: `400 Bad Request`  
Expected message: `Correct answer must match one option.`

### Test 32 — Invalid diagnostic score

Endpoint:

```http
POST /api/diagnostic/submit
```

Headers:

```http
x-role: learner
```

Body:

```json
{
  "learnerId": "u6",
  "score": 101
}
```

Expected status: `400 Bad Request`.

### Test 33 — Valid diagnostic score

Body:

```json
{
  "learnerId": "u6",
  "score": 72
}
```

Expected status: `201 Created`  
Expected level: `INTERMEDIATE`.

---

## Feedback / Notifications / Config

### Test 34 — Invalid feedback rating

Endpoint:

```http
POST /api/feedback
```

Headers:

```http
x-role: instructor
```

Body:

```json
{
  "instructorId": "u3",
  "learnerId": "u6",
  "message": "Good progress",
  "rating": 8
}
```

Expected status: `400 Bad Request`.

### Test 35 — Invalid notification type

Endpoint:

```http
POST /api/notifications
```

Headers:

```http
x-role: instructor
```

Body:

```json
{
  "userId": "u6",
  "message": "Hello",
  "type": "random"
}
```

Expected status: `400 Bad Request`.

### Test 36 — Invalid config number

Endpoint:

```http
PATCH /api/admin/config
```

Headers:

```http
x-role: admin
```

Body:

```json
{
  "maxDailyTrades": 0
}
```

Expected status: `400 Bad Request`.

### Test 37 — Valid config update

Body:

```json
{
  "maxDailyTrades": 10,
  "defaultTradingLimit": 150000,
  "maintenanceMode": false,
  "platformName": "IndAI"
}
```

Expected status: `200 OK`.

---

## Tests Run in This Patch Environment

The following checks were run in the container:

```bash
cd back-end
./node_modules/.bin/tsc -p tsconfig.json --noEmit
node dist/main.js
```

Important endpoint checks run:

| Test | Result |
|---|---|
| Valid login `learner@indai.com` | `201`, success true |
| Valid learner registration with Gmail + Indian phone | `201`, user created |
| Duplicate same registration email | `409`, Email already registered |
| Invalid phone | `400` |
| Invalid trading quantity | `400` |
| Unknown trading symbol | `404` |
| Sell more than owned | `400` |
| Invalid progress > 100 | `400` |
| Invalid diagnostic score > 100 | `400` |
| Invalid feedback rating > 5 | `400` |

Note: `npm run build` generated `dist/`, but in this execution environment the `nest build` command sometimes did not return before tool timeout even after emitting output. `tsc --noEmit` passed cleanly and the compiled server booted successfully.
