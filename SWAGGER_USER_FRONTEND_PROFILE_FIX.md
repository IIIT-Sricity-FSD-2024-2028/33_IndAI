# Swagger User → Frontend Profile Sync Fix

This patch fixes the issue where a user created from Swagger could log in from the frontend, but dashboard Settings/Profile fields appeared blank.

## What changed

- Frontend login now stores the full backend user profile inside `indai_session.user`.
- `Auth.getCurrentUser()` now falls back to the session profile if the local Review-3 mock store does not already contain the Swagger-created backend user.
- Backend user creation now preserves normalized lowercase frontend role/status values instead of accidentally storing raw Swagger enum values like `LEARNER`.
- Backend user creation now accepts compatibility aliases such as `experienceLevel` and `yearsOfExperience`.
- The frontend keeps the typed password only in local browser state so the existing Settings > Change Password validation still works for Swagger-created users.

## Correct Swagger user creation flow

Use `POST /api/users` with header `x-role: ADMIN` or `x-role: SUPER_USER`, or use public `POST /api/auth/register`.

Then log in from `front-end/pages/login.html` with the same email, password, and selected role.
