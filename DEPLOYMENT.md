# Deployment

The active entry is `node back-end/server.js --serve`, with the Vite build in
`frontend/dist`. Use Node 24. Install with root `npm ci`, build with `npm run build`,
and configure a durable, private DATA_DIR before starting the process.

Production configuration is validated by `back-end/config.js`. Set
NODE_ENV=production, DEMO_MODE=false, MARKET_SOURCE=upstox, and an HTTPS PUBLIC_URL.
Configure SMTP_HOST/SMTP_FROM and any authentication required by your mail host.
Provision bootstrap admin email/password/TOTP secrets through the environment;
do not commit them. Market access and analytics credentials are optional separate
secrets as required by the chosen market endpoints. Configure Razorpay key ID,
secret and webhook secret before enabling real checkout. Never use live payment
credentials for the automated demo tests. Set actual plan prices in integer
paise; demo example prices are not production pricing.

The server serves the SPA and `/api` on the same origin. Terminate HTTPS at a
trusted reverse proxy and restrict direct access; the production app trusts one
proxy hop. Preserve Origin and request headers. Session cookies, first-party
request headers and the signed raw-body payment webhook use different checks.
`GET /api/health` is liveness; `GET /api/ready` includes database/worker readiness.

```sh
docker build -t indai .
docker run --rm --env-file /secure/path/indai.env -p 3000:3000 -v indai-data:/app/data indai
```

The Docker runtime uses the non-root node user. Ensure a bind-mounted DATA_DIR
is writable by that user. The image excludes legacy NestJS source and local data.
Docker execution must be verified on a host with Docker; source inspection is
not an image build test. Install Chromium only in a test environment if needed.

Back up SQLite with a consistent SQLite backup or while the process is stopped;
copying only a live .sqlite file can omit WAL transactions. Keep backups private.
The runtime applies numbered SQLite migrations; these do not import legacy JSON.
Follow [data migration](docs/DATA_MIGRATION.md) before production replacement.
