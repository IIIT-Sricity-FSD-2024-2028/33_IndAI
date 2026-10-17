# Linked Demo Data Verification

Date: 2026-10-17. Environment: Linux, Node.js 24.19.0, npm 11.9.0; headless Playwright Chromium for browser checks. Tests use disposable data directories and real local backend servers.

## Changes

- Added `back-end/src/store/demo.seed.ts` and a fresh-demo-only call from DataStore. Added eight public sample accounts, giving 15 accounts across six actor portals.
- Linked two instructors to their own learner groups; added two workshop courses, institution access rules, enrollments, quizzes, assignments, sessions, feedback and notifications.
- Added a local WebM lesson and PDF workbook in `back-end/data/demo/`. Each workshop receives independent copies of its media files in its local upload directory.
- Added `scripts/prepare-demo.mjs` and `npm run demo:prepare` to create optional virtual portfolios through authenticated backend APIs. Existing orders/positions are preserved.
- Updated existing regression expectations for the larger learner population and added API/browser coverage for the new relationships. These demo-data additions preserve the application APIs and permission rules. The subsequent Holdings UI change is described below.
- Updated README and actor account documentation. No private environment file, installed dependency tree, generated build, persisted user store or real service credential is packaged.

## Results

| Check | Status | Evidence |
| --- | --- | --- |
| Production build | VERIFIED PASS | `npm run build`; React/Vite and NestJS compilation |
| API/integration regression suite | VERIFIED PASS | `npm test`; 37 tests, zero failures |
| All 15 account logins | VERIFIED PASS | `tests/demo-data.test.mjs`; returned roles/access tokens |
| Related instructor notifications | VERIFIED PASS | Selected learner and both assigned learners receive messages; unrelated learner request rejected |
| Assignment submission and approval | VERIFIED PASS | Submission visible to instructor; approval adds 30 points once; unrelated class submission rejected |
| Provider edit, media and institution boundaries | VERIFIED PASS | Learner sees edited title and signed media; unrelated institution access and other-provider edit rejected |
| Prepared portfolios | VERIFIED PASS | Two actual virtual orders per new learner; repeated command adds no duplicates |
| Restart persistence | VERIFIED PASS | Changed material, points, notifications and virtual orders retained after backend restart |
| New React interaction test | VERIFIED PASS | `npm run test:demo:browser`; UI notification delivery, submission/approval, provider edit, learner video playback and completion |
| Existing browser regression suite | VERIFIED PASS | `npm run test:browser`; all five browser scripts completed |
| Fresh ZIP installation | VERIFIED PASS | Fresh extraction, `npm run setup`, `npm run build`, `npm test`, `npm run test:demo:browser` |
| Root production/development launchers | VERIFIED PASS | `node tests/launch-check.cjs`; root start at 3000, dev at 5173, proxy, login, refresh and restart |
| Native Windows execution | NOT TESTED | No Windows host available |
| Actual GitHub Code > Download ZIP | NOT TESTED | No remote push performed; authorization is still required |
| Real payment, email, live market service | NOT TESTED | Not required for these local demo workflows; external credentials are not packaged |

The existing `npm run test:browser` suite passed against the expanded seed. The archive contains 265 files, uses standard forward-slash paths, passes CRC checks, and was extracted and compared byte-for-byte with the tested source. Fresh installation started without bundled node_modules, environment files, build output or saved stores. The final documentation was updated with these results after execution; the packaged application code is identical to the tested extraction. Local checks do not establish a GitHub-download or Windows pass.

## Reproduce

```powershell
npm run setup
npm run build
npm test
npx playwright install chromium
npm run test:demo:browser
npm run test:browser
```

Browser installation requires internet and is needed only for automated browser tests, not normal app use. In one terminal run `npm start`; in another run `npm run demo:prepare` if sample holdings are wanted. Open port 3000 and use `docs/ACTOR_DEMO_ACCOUNTS.md`.

Expanded seed data is created on first startup of a fresh demo data directory. Existing saved stores are restored without inserting new mock accounts or overwriting saved work. New session/due dates are relative to that first startup and then persist. These accounts are for course-project demonstrations only.


## Holdings Buy/Sell shortcuts

Buy and Sell buttons now appear next to each held stock in Portfolio and in the trading workspace. They select the held instrument's exact key/exchange and requested order side in the existing order form. Clicking a shortcut does not execute an order. The user reviews quantity and places the virtual order; normal cash, position and backend validation remain active. Switching from another holding resets quantity to one and order type to Market. The order button waits for the portfolio and quotes to load.

Changed UI files: `frontend/src/components/Common.jsx`, `frontend/src/components/TradingWorkspace.jsx`, and `frontend/src/pages/Dashboard.jsx`. No backend, account seed or external-service configuration was changed for this UI update.

VERIFIED PASS: production build; 37 API/integration tests; fresh ZIP setup/build and `node tests/browser-holdings.cjs`. The new browser test exercises Portfolio Buy/Sell actions, in-workspace switching to another instrument, delayed portfolio responses, no automatic execution, filled virtual orders, overselling rejection and persisted holdings after reload. Existing profile, course and trading browser regression coverage also passes using `node tests/browser-regression.cjs`.

The actual GitHub Download ZIP and native Windows execution remain NOT TESTED. No GitHub push was performed.

### Holdings button layout correction

VERIFIED PASS: Buy and Sell are grouped in a non-wrapping row beside the stock symbol. The browser test checks their horizontal alignment at viewport widths of 390, 768 and 1440 pixels and then verifies selected instrument/side, filled virtual orders, overselling validation and reload persistence. Production build passed. Jeswanth's learner responsibility record and the team scope metadata now document the Holdings callbacks; the other four individual records remain applicable. All five records' source references were checked.
