# Start IndAI

1. Install Node 24, open a terminal at the repository root, and run `npm run setup`.
2. Run `npm run dev` and open http://localhost:5173.
3. Use a demo account from [README](README.md), with `IndAI-Demo-2026`.
4. For a built demo, run `npm run build` then `npm start` and open port 3000.

Windows users can run `START_WINDOWS.bat`; macOS/Linux users can run
`bash start_mac_linux.sh`. Both install/setup before starting development.
Keep the terminal open. Stop both development processes with Ctrl+C.

`npm ci` uses the root workspace lock. Environment settings belong in the root
`.env`. Do not use the historical NestJS `.env` or start its old compiled entry.
If a port is occupied, change root `.env` PORT/PUBLIC_URL together and restart.
See [deployment](DEPLOYMENT.md) and [migration limits](docs/DATA_MIGRATION.md).
