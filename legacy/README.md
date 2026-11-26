# Previous NestJS implementation

This directory preserves the previous manifests, test files and documentation.
The historical Nest source remains at `back-end/src/`, `back-end/algo/` and
`back-end/data/` for comparison. It is excluded from the new Docker image and is
not started by current scripts. The active backend is `back-end/server.js`.

This archive is a source reference, not a runnable package. Archived tests retain
their original contents, so their old relative imports are not valid here.
To reproduce the old 37-test run, use a separate checkout of commit
`e82e86917feaaa8309669fd6c2ee8164b8867448` and its documented Node setup.
Do not copy production credentials or runtime JSON data into Git.

The new application does not automatically migrate old JSON persistence or
implement every old institution, CSV intake and live scheduling workflow.
See `docs/DATA_MIGRATION.md` before choosing a production migration.
