# IndAI React and Redux application

The React Router/Redux Toolkit frontend is paired with the matching Express 5
API, opaque cookie sessions and SQLite persistence. This branch integrates the
five authorized module imports and the coordinator's shared runtime changes.

## Run locally

Use Node 24 and npm. From this repository root:

```sh
npm run setup
npm run dev
```

Setup installs the npm workspaces using the root lockfile, creates a local root
`.env` from the sanitized example only when absent, applies SQLite migrations,
and seeds demo accounts in demo mode. It does not overwrite an existing `.env`.
Open http://localhost:5173; the dev server proxies `/api` to localhost:3000.

```sh
npm run build
npm start
```

The built frontend and API are served together at http://localhost:3000.
`npm start` requires `frontend/dist` from the build command. The default example
is for local demos only. See [deployment](DEPLOYMENT.md) for production settings.

## Demo accounts

All following accounts use the local-demo password `IndAI-Demo-2026`:

| Workspace | Email |
| --- | --- |
| Free learner | student1@indai.test |
| Pro learner | student201@indai.test |
| Plus learner | student261@indai.test |
| Instructor | instructor1@indai.test |
| Course Provider | provider1@indai.test |
| Admin, including payment operations | users@indai.test |
| Super Admin | super@indai.test |

The updated application unifies admin permissions. Payment Admin remains the
team's responsibility area, while the application uses Admin/Super Admin roles.
Use only demo payment confirmation in local tests; provider payouts record an
external transfer reference and do not perform a bank transfer automatically.

## Verify

```sh
npm test
npm run verify:submission
npm run test:catalog-ui
npm run test:smoke
npm run test:browser
npm run test:trading-ui
```

Install Playwright Chromium with `npx playwright install chromium` if absent.
Browser checks require a production build and use isolated local demo databases.
See [testing](docs/TESTING.md) and the [verification record](docs/VERIFICATION.md).

## Packages and persistence

Root `package-lock.json` is authoritative for the `frontend` and `back-end` npm
workspaces. Run `npm ci` from the root; do not install separate nested dependency
trees. The existing frontend lockfile is retained from its standalone upload.
Root commands use one hoisted React installation for UI and Redux/SSR checks.
Backend runtime dependencies are declared in `back-end/package.json`.

SQLite defaults to `data/indai.sqlite`; set `DATA_DIR` for persistent storage.
`back-end/migrations/` contains the runtime schema. Local secrets, databases,
uploads, build output and dependencies are excluded from Git.

## Existing NestJS installation

The earlier NestJS source/assets are retained in `back-end/src`, `back-end/algo`
and `back-end/data`. Previous manifests, tests and documentation are in `legacy/`.
These are historical references and are excluded from the active runtime.
Old JSON users, balances, institutions and scheduling data are not automatically
converted. Review [data migration](docs/DATA_MIGRATION.md) before any production
cutover. No legacy runtime data is copied, deleted or overwritten by this import.

## Module contributors

| GitHub account | Module |
| --- | --- |
| Jeswanth09052007 | Learner |
| me-coder7 | Instructor |
| Purvaj-P22 | Course Provider |
| BharanRajP | User Admin + Super Admin |
| gurwinder-s24 | Payment Admin |

See [contribution records](INDIVIDUAL_CONTRIBUTION.md) for exact source paths,
author-specific import commits and the separate coordinator integration work.
