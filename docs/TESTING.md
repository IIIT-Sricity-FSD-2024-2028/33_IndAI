# Verification commands

Use Node 24, run `npm run setup`, and build before browser/smoke checks.

| Command | Coverage |
| --- | --- |
| npm test | Vitest API, Redux, catalogue, replay, notifications and domain tests |
| npm run verify:submission | Maintained contributor paths, anchors and import commit identities |
| npm run test:catalog-ui | Catalogue/watchlist server-rendered React checks |
| npm run test:smoke | Development startup, built SPA refresh, readiness and JSON API 404 |
| npm run test:browser | Actual built UI/API demo workflows across role workspaces |
| npm run test:trading-ui | Actual terminal, charts, watchlists and responsive layouts |

Root workspace dependency resolution avoids separate React copies. Chromium is
required for browser checks (`npx playwright install chromium`). API/browser
tests use local demo data, not live payment/transfer operations. The general
browser runner accepts TEST_PORT; the trading runner defaults to port 3344.
The test files are maintained source, while databases/screenshots are artifacts.

Legacy .mjs/.cjs tests are archived unchanged in `legacy/tests/`. They tested the
old NestJS API and old HTML selectors; do not count their earlier 37 passing
tests as new-stack verification. See `legacy/README.md` to reproduce that version.
Current test results and limits are recorded in `docs/VERIFICATION.md`.
