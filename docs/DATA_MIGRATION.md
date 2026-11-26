# Data and feature migration boundary

The previous runtime stores JSON in `persistent-data/platform.json`; the new
runtime uses SQLite in DATA_DIR (default root `data/indai.sqlite`). Existing JSON
files, uploaded media and credentials are not copied into Git or overwritten by
setup. SQL migrations 001 through 008 evolve this new SQLite schema only. They
are not a JSON-to-SQLite converter. User IDs, roles, statuses, plan names and
authentication formats differ. Existing JWTs/refresh sessions are not migrated.

This branch is suitable for review and a fresh local demonstration. A production
cutover with existing users requires a separately reviewed conversion process:

1. Inventory required users, balances, payments/refunds, enrollments, media,
   institutions and scheduling data; record legacy-to-new feature mappings.
2. Back up the old JSON/media while writes are stopped. Preserve an isolated
   checkout of e82e86917feaaa8309669fd6c2ee8164b8867448 for rollback.
3. Build and test an idempotent importer in a separate empty SQLite database.
   Maintain ID mappings, role/status conversions, financial reconciliation and
   explicit handling of unsupported records. Do not assume password formats match.
4. Reconcile counts, balances, ownership, permissions and attachments. Require
   reauthentication and verify all roles against the actual UI/API.
5. Switch the runtime only after the required workflows/data are accepted; keep
   the old data read-only for rollback under an agreed retention policy.

No importer is implemented here. Institution intake/CSV onboarding and the old
live session scheduling workflows have no complete direct equivalent in the
supplied updated app. Admin divisions are intentionally unified. These limits
must be accepted or implemented before replacing a deployment that needs them.

DataBase/DBschema.sql and ER Diagram.drawio.png are historical MySQL-style
reference artifacts. They are not applied by the SQLite runtime. Current schema
authority is `back-end/migrations/*.sql`; see `docs/DATABASE.md` for an overview.
