# IndAI

## Overview

IndAI is a financial-literacy and paper-trading course project built with React and NestJS. It combines structured learning with virtual stock-market practice in one role-based application. Learners can manage virtual holdings and follow courses; instructors, course providers and administrators manage teaching, content and platform operations.

Trading uses virtual funds. Application orders do not execute at a broker or transfer real money. Optional Upstox market data, Razorpay payments and SMTP delivery are configured independently on the backend.

## Features

| Actor | Application capabilities |
|---|---|
| Learner | Virtual market/limit/stop orders, order cancellation, portfolio/recorded-value chart, watchlist, course enrollment, lesson completion, quizzes, assignment submission and notifications |
| Course Provider | Course drafts/modules, lesson video/PDF uploads, MCQ/PDF assessments, written-answer grading, course assignments, publication-review interaction, analytics and earnings views |
| Instructor | Assigned learners, assignments/submission approval, scheduled sessions, selected/all-assigned in-app notices, performance and earnings views |
| User Admin | Account administration, instructor mapping, institutions, intake invitations and validated CSV roster import |
| Payment Admin | Course commercial review/counter-offers/publication, revenue reporting and compensation records |
| Super Admin | Actor-specific account administration, staff approvals, platform configuration, reports and audit/activity views |

User Admin and Payment Admin are divisions of the stored `admin` role. The other stored roles are `learner`, `provider`, `instructor` and `superuser`. Backend identity, role, division and ownership rules enforce API access.

## Technology stack

| Area | Implementation |
|---|---|
| Runtime | Node.js 24; local verification uses Node 24.19.0 and npm 11.9.0 |
| Frontend | React 19.2.0, React DOM 19.2.0, JavaScript/JSX, Vite 7.1.12 and CSS |
| Backend | NestJS 12.0.1, Express adapter and TypeScript 6.0.3 from the lockfile |
| Validation | class-validator and class-transformer through Nest ValidationPipe |
| Authentication | HS256 JWT access tokens, HttpOnly refresh cookie and salted scrypt password hashes |
| Persistence | Local JSON platform/virtual-account stores and local uploaded files |
| Market data | Bundled CSV demonstration data and synthetic demo instruments; optional configured Upstox data |
| Charts | React-rendered inline SVG price/portfolio charts |
| Integrations | Razorpay HTTP checkout/verification, Multer uploads, Nodemailer SMTP and Swagger/OpenAPI |
| Testing | Node built-in test runner and Playwright browser checks |

Navigation uses pathname selection, browser navigation and dashboard tab state. React Router, Redux and a frontend Context provider are not part of this implementation. `DataBase/DBschema.sql` is a schema reference; a database server is not required for local execution.

## Project structure

| Path | Purpose |
|---|---|
| `frontend/src/main.jsx` | React entry point, public pages and authenticated page selection |
| `frontend/src/pages/` | Authentication flow and dashboard composition |
| `frontend/src/layouts/` | Public-page and actor-portal layouts |
| `frontend/src/components/` | Forms/dialogs, trading, learning, management, commerce and reporting |
| `frontend/src/hooks/useResource.js` | Fetching, polling, mutation refresh and cleanup |
| `frontend/src/services/` | Authenticated HTTP helper and checkout integration |
| `frontend/src/styles/` | Existing application CSS and theme rules |
| `back-end/src/main.ts` | Nest bootstrap, API prefix, validation, Swagger and built-frontend serving |
| `back-end/src/modules/` | Role-aware business APIs |
| `back-end/src/common/` | Guards, middleware, validation/password/media helpers and persistence interceptor |
| `back-end/src/store/` | Platform JSON persistence and demo data initialization |
| `back-end/algo/` | Per-user virtual trading and market-data engine |
| `back-end/data/stocks/` | Bundled stock CSV datasets |
| `scripts/` | Configuration and startup |
| `tests/` | API/engine/browser tests and media fixtures |
| `docs/` | Architecture, API, team responsibility and test documentation |
| `individual-contributions/` | Five member contribution-scope records |

## Prerequisites

- Node.js **24 LTS**, including npm. The root engine range and setup script require Node major version 24.
- A current browser and a writable fully extracted project directory.
- Free ports **3000** and **5173**. The development frontend uses strict port selection.
- Internet for the initial dependency installation. Optional browser-test installation also downloads Chromium.

No global Nest/Vite CLI, running database or private third-party API key is required for the local demo workflows. npm is not separately version-pinned; 11.9.0 is the locally tested version. Linux execution is tested; Windows-specific execution remains a platform verification item.

## Installation and startup

Extract the full project or clone its complete source. Open PowerShell in **`IndAI_React`**, the directory containing the root `package.json`, `frontend`, `back-end` and `scripts`.

Check the installed tools:

```powershell
node --version
npm --version
```

Install, build and start the complete application on one port:

```powershell
npm run setup
npm run build
npm start
```

Open **http://localhost:3000**. Sign-in is at **http://localhost:3000/login.html**, and API documentation is at **http://localhost:3000/api/docs**. Keep the terminal running; press **Ctrl+C** to stop.

`setup` generates a private `back-end/.env` with random JWT secrets/admin registration code, preserves an existing environment file and installs the locked root/frontend/backend dependencies using npm ci. `build` generates React and Nest outputs. `start` runs Nest from the backend directory and serves the built frontend with the APIs.

The source archive intentionally omits node_modules, `.env`, runtime data/uploads and dist. The commands generate what is needed locally. Do not use an omit-dev install before building: Vite, TypeScript and the Nest CLI are build dependencies.

### Development

After setup:

```powershell
npm run dev
```

Open **http://localhost:5173**. The root launcher starts Nest on 3000 and Vite on 5173; Vite proxies `/api` and `/uploads` to the backend. Stop the existing one-port server before switching modes.

Separate terminals can also be used, both starting at the application root:

```powershell
npm --prefix back-end run start:dev
```

```powershell
npm --prefix frontend run dev
```

If PowerShell blocks npm.ps1, use `npm.cmd` instead of npm. Execute the shown commands on separate lines. The React directory is **frontend**, not front-end; do not open its index.html directly in a file browser.

## Local demo accounts

A fresh demo store now contains **15 sample accounts**, linked into two instructor groups. See [all actor accounts and linked workflows](docs/ACTOR_DEMO_ACCOUNTS.md). Existing saved stores are preserved and are not automatically expanded.


The following public sample credentials are seeded when `DEMO_MODE=true`. They are for local demonstration, not private production accounts.

| Portal | Email | Demo password |
|---|---|---|
| Super Admin | superadmin@indai.com | Admin@1234 |
| User Admin | admin@indai.com | Admin@1234 |
| Payment Admin | paymentadmin@indai.com | Pay@1234 |
| Instructor | instructor@indai.com | Inst@1234 |
| Course Provider | provider@indai.com | Prov@1234 |
| Learner | learner@indai.com | Learn@1234 |

Login selects a dashboard from the stored account role. Public staff registration follows an approval flow. A fresh non-demo deployment requires private bootstrap-admin settings.

## Configuration

Use `back-end/.env.example` as the public reference. Setup creates the private local environment; never commit that file or real keys/passwords.

| Variable group | Purpose |
|---|---|
| PORT / PUBLIC_URL | Backend port and browser origin; template 3000 and http://localhost:5173 |
| JWT_SECRET / JWT_REFRESH_SECRET | Independently generated private signing secrets |
| JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN | Access/refresh lifetime; template 15m / 7d |
| DEMO_MODE | Local seeded sample accounts and content |
| DATA_DIR | Optional absolute persistent-data directory |
| INITIAL_PAPER_CASH / REPLAY_CANDLE_MS | Virtual-account starting funds and replay timing |
| RAZORPAY_* | Optional payment keys, webhook and payment-link settings |
| UPSTOX_ANALYTICS_TOKEN | Optional private read-only market-data token |
| SMTP_* | Optional real institution-mail delivery configuration |
| BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD | Private initial administrator for a fresh non-demo store |

By default, platform data is saved in `back-end/persistent-data/platform.json`, virtual accounts under its research directory, and uploads under `back-end/uploads`. With DATA_DIR configured, platform/virtual-account data and uploads use the configured location. Preserve these files and the private environment when retaining data.

For institution invitation links in one-port mode, configure PUBLIC_URL as `http://localhost:3000` before generating links. In development, retain the 5173 origin. Real mail, live market data and hosted checkout require their own service configuration; local virtual trading, account/profile and free learning workflows operate without those keys.

## Main workflows

1. **Account access:** sign in, enter the role dashboard and edit profile details through validated backend endpoints.
2. **Paper trading:** search/select a demo instrument, buy/sell virtual shares, inspect portfolio/order history and maintain saved watchlist entries. Default watchlists already include TCS, RELIANCE and INFY; duplicate additions are rejected.
3. **Learning:** a provider creates content and assessments, Payment Admin publishes an eligible course, and an enrolled learner completes lessons and submits quiz answers. PDF quizzes use written answers with manual grading; they do not generate MCQs automatically.
4. **Teaching:** an instructor manages assigned learners, assignments, sessions and in-app notices. Instructor recipients are checked again on the server.
5. **Administration:** institution account intake, staff approval, commercial course review and platform reporting operate through the relevant admin actor/division.

Uploaded WebM or H.264/AAC MP4 is recommended for browser playback. PDF access uses signed links; reopen content to renew an expired media URL. Recorded portfolio history reflects saved valuations and does not reconstruct invented past activity. Internal earnings/compensation entries are ledger records, not bank transfers.

## Team

| Member | Roll number | Actor responsibility |
|---|---|---|
| Bharan | S20240010176 | User Admin; Public pages, authentication and registration |
| Jeswanth | S20240010202 | Learner; Learner-facing trading and learning integration |
| Purvaj | S20240010178 | Course Provider; Provider-facing content and assessment lifecycle |
| Praneeth | S20240010179 | Instructor; Shared profile, theme and interaction components |
| Gurwinder | S20240010082 | Super Admin, Payment Admin; Authorization, commercial administration and platform reporting |

See [team responsibilities](docs/TEAM.md) and the [individual contribution index](INDIVIDUAL_CONTRIBUTION.md) for implementation boundaries and file references. Learner and Course Provider remain dedicated work packages; smaller administrative actors and shared account/onboarding components balance the other packages.

## Verification

```powershell
npm run build
npm test
```

Optional browser checks:

```powershell
npx playwright install chromium
npm run test:browser
node tests/launch-check.cjs
```

Run launch-check only in a disposable fresh copy with ports 3000/5173 free; it starts/stops the actual root launch commands and writes demo profile data. See [testing](docs/TESTING.md) for coverage and verification boundaries. No standalone frontend unit-test or working locked ESLint setup is configured; build success is not a lint result.

## Troubleshooting

| Symptom | Action |
|---|---|
| package.json not found | Enter the application root containing frontend/back-end/scripts. |
| Unsupported Node or npm unavailable | Install Node 24 with npm and reopen the terminal. |
| Missing dependencies/environment | Run npm run setup from the root. Existing environment settings are preserved. |
| Missing build or blank one-port page | Run npm run build before npm start. |
| Port conflict | Stop old servers and run only one launch mode. Vite refuses an occupied 5173. |
| Frontend cannot reach APIs | Check the Nest terminal and port 3000; the development proxy targets that port. |
| Login rejected | Check credentials, account status, demo mode and retained local data. |
| Dashboard returns to login after token expiry | Sign in again. Dashboard startup reads /auth/me directly; that auth path is excluded from the helper's automatic refresh branch. |
| Multiple role sessions interfere | Use separate browser profiles/contexts because the refresh cookie is shared within a profile. |
| Course missing or lesson locked | Check commercial publication, enrollment and required access tier. |
| Optional service unavailable | Configure the relevant private service settings; no live service success is implied by fixture tests. |

## Documentation

- [Architecture and React implementation](docs/ARCHITECTURE.md)
- [API overview](docs/API.md)
- [Team responsibilities](docs/TEAM.md)
- [Testing and limitations](docs/TESTING.md)
- [Deployment](DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

## Optional sample portfolios

After `npm run setup`, `npm run build` and `npm start`, open a second terminal in the project root and run `npm run demo:prepare`. This places two real virtual orders through the backend for each new sample learner (Asha, Neha and Vikram). It preserves accounts with existing orders/positions. The original learner account stays available for a clean live trading demonstration. No exchange orders or payments occur.

Fresh demo stores also contain two linked workshop courses with a short local video, a PDF workbook, quizzes, enrollments, upcoming assignments and review sessions. Sample media is copied from `back-end/data/demo/` into the new local data directory on first start. Use a separate fresh extraction to try the expanded seed; changing `DEMO_MODE` does not replace an existing saved store. See [demo verification](docs/DEMO_DATA_TEST_REPORT.md).

## Trade from Holdings

Each current holding has Buy and Sell shortcuts beside its symbol in Portfolio and in the trading workspace. A shortcut selects the exact held instrument and order side in the existing order form. Review the quantity and place the virtual order explicitly. The normal cash and available-share checks still apply.
