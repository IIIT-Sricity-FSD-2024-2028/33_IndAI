# Swagger-created user frontend login sync fix

## Problem fixed
When a user was created directly from Swagger, the backend user existed in NestJS memory, but the Review-3 frontend local demo store did not always receive the full user/session shape after login. That made the dashboard sometimes fail to reflect newly-created Swagger users correctly.

## Targeted changes
- Added `POST /api/auth/register` as a compatibility public registration endpoint.
- Kept existing `POST /api/users/register` unchanged.
- Added optional `confirmPassword` support in `CreateUserDto` so Swagger bodies copied from frontend-style forms do not fail because of strict whitelist validation.
- Backend now rejects mismatched `password` and `confirmPassword` with `400 Bad Request`.
- Frontend login now robustly syncs backend-created users into `IndAIData.users` after successful backend login.
- Frontend session now stores normalized frontend role names such as `learner`, `instructor`, `provider`, `admin`, and `superuser`.
- Frontend UI/UX was not redesigned.

## How to test
1. Start backend:
   ```bash
   cd back-end
   npm run start:dev
   ```
2. Open Swagger:
   ```text
   http://localhost:3000/api/docs
   ```
3. Create a learner using either:
   ```text
   POST /api/auth/register
   ```
   or:
   ```text
   POST /api/users/register
   ```
4. Example body:
   ```json
   {
     "firstName": "Test",
     "lastName": "Learner",
     "email": "testlearner@gmail.com",
     "password": "Test@1234",
     "confirmPassword": "Test@1234",
     "role": "learner",
     "phone": "9876543210",
     "status": "active",
     "institution": "IIIT Sri City",
     "studentId": "STU999",
     "experience": "Beginner",
     "riskTolerance": "Medium"
   }
   ```
5. Open frontend through Live Server:
   ```text
   front-end/pages/login.html
   ```
6. Login with:
   ```text
   Role: Learner
   Email: testlearner@gmail.com
   Password: Test@1234
   ```
7. Expected: learner dashboard opens and the user is available in frontend local state.
