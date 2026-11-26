import fs from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of ['back-end/.env', 'back-end/node_modules/@nestjs/core/package.json', 'back-end/dist/main.js', 'frontend/dist/index.html']) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing ${file}. From IndAI_React run: npm run setup && npm run build`);
    process.exit(1);
  }
}
const p = spawn(process.execPath, ["dist/main.js"], {
  cwd: path.join(root, "back-end"),
  stdio: "inherit",
  env: { ...process.env },
});
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => p.kill(s));
p.on("exit", (code) => {
  process.exitCode = code || 0;
});

p.on("error", (e) => { console.error(e.message); process.exitCode = 1; });
