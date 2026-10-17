# Contributing to IndAI

Use one integrated repository. The [actor responsibility matrix](docs/TEAM.md) identifies the primary integration boundaries, while shared components are coordinated across actor leads.

## Development workflow

1. Work from an up-to-date clone and preserve its existing Git history.
2. Create a focused branch for a real change. Use the contributor's own configured identity and authentication.
3. Keep role behavior, backend authorization, state persistence and API error handling consistent.
4. Inspect the diff, build, run applicable tests and validate documentation before opening a review request.
5. Merge reviewed changes into the default branch only after project checks pass. Commit messages should describe the actual changes; do not create empty or duplicate uploads merely to increase commit counts.

From the application root:

```powershell
npm run setup
npm run build
npm test
```

The setup installs locked dependencies. Browser coverage can be run with npm run test:browser after installing Chromium through Playwright. See [testing](docs/TESTING.md).

## Shared files

Coordinate function/role-specific edits in Dashboard.jsx, Learning.jsx, Management.jsx, Commerce.jsx and Common.jsx. A file containing several actors' branches is a shared implementation boundary, not an exclusively owned module. Document API/props changes and review their consuming actors.

## Repository contents

Keep frontend/backend sources, lockfiles, startup scripts, tests, fixtures, bundled datasets, environment examples and project documentation. Exclude private .env files, tokens/credentials, node_modules, generated builds, runtime stores/uploads and temporary files. Never put personal access tokens or passwords in a contribution sheet.

For reproducible releases, extract or clone into a new writable folder, install/build from the documented commands and exercise the affected real workflows. Local build checks and a deployed external service are different verification levels.
