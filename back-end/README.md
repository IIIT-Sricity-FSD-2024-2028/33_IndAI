# Active backend

`server.js` starts the Express/session/SQLite application used by the Redux UI.
Run setup, development, build and tests through the repository root package.
The root `.env` is loaded by `config.js`; use the root `.env.example` template.
Migrations under `migrations/` run in numeric order through `db.js`.

`src/`, `algo/` and `data/` are preserved historical NestJS source/assets.
They are not compiled or started by this package. Historical manifests are in
`legacy/back-end/`; see `legacy/README.md` for reproduction instructions.
