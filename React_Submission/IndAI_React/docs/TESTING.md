# Testing

Run project checks from the application root. Build before executing tests that start the compiled backend. API tests use disposable stores and browser scripts exercise real React-to-Nest interactions.

```powershell
npm run setup
npm run build
npm test
```

Optional browser checks require Playwright Chromium:

```powershell
npx playwright install chromium
npm run test:browser
node tests/launch-check.cjs
```

The launch check requires free ports 3000/5173 and a disposable fresh directory because it writes demo account data and starts/stops both root launch modes. Browser scripts use isolated test stores. No private optional-service keys are needed for the local checks.

## Verification results

| Check | Result |
|---|---|
| Fresh dependency installation | Passed on Linux x64 with Node 24.19.0 / npm 11.9.0 |
| React production build | Passed |
| Nest/TypeScript production build | Passed |
| API/engine integration suite | 36 passed; 0 failed; 0 skipped |
| Team/source/documentation validation | Passed |
| ZIP integrity, fresh extraction and retained-source comparison | Passed during archive preparation |
| Windows runtime | Not executed in the Linux test environment |
| Real SMTP, Razorpay and Upstox provider acceptance | Requires service-specific deployment testing |

Browser suites are included for real UI regression testing. This documentation update preserves the application/UI files byte-for-byte; the full browser suite is not rerun as part of the documentation-only change. Earlier application verification exercised role dashboards, profile changes, trading/portfolio/watchlist, publication/enrollment, lessons, quizzes, notifications and administration.

## Coverage

- API/engine checks cover credential/role resolution, refresh rotation, ownership, user/account workflows, virtual order policies and isolated accounts.
- Course checks cover enrollment/progress, assignment submission/approval, one-time rewards, quiz validation/scoring and media access.
- Commercial fixtures cover signature/captured-payment rules and webhook idempotency; they are not live charged payments.
- CSV/intake and a local SMTP sink validate parsing/import and protocol behavior; a sink is not real external mail delivery.
- Browser smoke/actions/homepage/regression/round2 scripts exercise real local backend responses rather than mocked frontend success.
- Packaging checks validate five team records, actual symbols/source paths and local Markdown links. Role responsibility metadata is an allocation record, not a substitute for Git history.

## Tooling boundaries

There is no standalone frontend unit-test command. The backend declares a lint command that calls ESLint with --fix, but ESLint is not included in the committed lockfiles. A reproducible lint pass is therefore not claimed, and the mutating formatter/lint scripts are separate from these build/API checks.

The source uses a single-process JSON persistence model. Test fixtures do not certify multiple backend replicas, hosted HTTPS/cookies, arbitrary video codecs, visual rendering of malformed PDFs or configured external-provider delivery.

## Known behavior

Dashboard startup reads /auth/me directly, which the shared API helper excludes from automatic refresh-on-401. A stale access token during a full startup can require sign-in again even when a refresh cookie exists. Normal valid-token reload and saved-state persistence are separate tested paths.

For manual verification, use a disposable local data store and the public demo accounts. Keep authentication/role restrictions active, inspect actual network responses and verify saved state after reload/restart. Do not replace backend errors with unconditional UI success.

## Expanded linked demo dataset

See [linked demo verification](DEMO_DATA_TEST_REPORT.md) for the expanded account seed and cross-actor API/browser checks. `npm test` now includes `tests/demo-data.test.mjs` (37 tests in total). Run `npm run test:demo:browser` after installing Playwright Chromium for the added React interaction check.
