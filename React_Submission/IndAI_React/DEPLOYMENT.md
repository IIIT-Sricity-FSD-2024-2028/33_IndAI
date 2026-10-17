# Deployment

## Runtime model

IndAI runs a built React frontend and NestJS APIs together on the backend port. The root production-style local workflow is:

```powershell
npm run setup
npm run build
npm start
```

This local command flow is tested with Node 24.19.0 on Linux. It does not by itself configure HTTPS, a domain, backups or external services. Windows execution and hosted infrastructure are separate checks.

## Environment and storage

Use a private environment configured from back-end/.env.example. Set NODE_ENV=production for an actual HTTPS deployment and provide independently generated JWT_SECRET and JWT_REFRESH_SECRET values. Set PUBLIC_URL to the exact browser origin. Refresh cookies use production/secure behavior; serve the application through HTTPS.

Disable public demo seeding for non-demo deployments. On a fresh DEMO_MODE=false store, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required; the bootstrap path requires a password of at least 12 characters. Never publish these values.

Configure an absolute writable DATA_DIR on persistent storage. Back up platform.json, the research account directory and uploaded media, together with secure configuration recovery procedures. Default local state and uploads are relative to the backend working directory; root launchers establish that directory consistently.

The current persistence layer is local JSON with atomic file replacement, intended for one backend process. Multiple replicas sharing files are not a supported transactional deployment. A production system with concurrent replicas requires a database/storage redesign, not simply more processes.

## Optional providers

- Razorpay needs matching private keys and webhook configuration. Backend signature/captured-payment rules determine activation; a client redirect is insufficient.
- Upstox provides read-only market data. Platform trades remain virtual and are not routed to the exchange.
- SMTP settings enable institution invitation/credential mail. In-app notifications are separate saved application records.

Real checkout, external webhook arrival, actual email delivery and live market credentials must be tested in the deployed environment. Local fixtures do not certify those services. Internal compensation ledgers do not transfer funds to bank accounts.

## Container source

The included Dockerfile uses Node 24, builds frontend/backend, prunes backend development dependencies and starts dist/main.js as the node user. Its runtime defaults include NODE_ENV=production, DEMO_MODE=false, port 3000 and DATA_DIR under the backend persistent-data directory. Mount persistent storage and supply private environment values when deploying it. Container build/hosting is not included in the local npm verification result.

## Operational checks

Verify the browser origin/CORS settings, secure cookies, startup logs, signed media URLs, permissions, storage persistence and restoration. Reopen lesson content to renew expired media links. Monitor HTTP errors and avoid exposing generated account credentials or tokens in logs. See [architecture](docs/ARCHITECTURE.md) and [testing](docs/TESTING.md).
