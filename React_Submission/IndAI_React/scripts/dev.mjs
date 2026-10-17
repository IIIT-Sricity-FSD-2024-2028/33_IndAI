import fs from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of ['back-end/.env', 'back-end/node_modules/@nestjs/cli/package.json', 'frontend/node_modules/vite/package.json']) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing ${file}. Run npm run setup first.`);
    process.exit(1);
  }
}
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npm, ["run", "start:dev"], {
    cwd: path.join(root, "back-end"),
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
  spawn(npm, ["run", "dev"], {
    cwd: path.join(root, "frontend"),
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
];
let closing = false;
const close = () => {
  if (closing) return;
  closing = true;
  children.forEach((p) => {
    if (!p.pid) return;
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(p.pid), '/T', '/F'], {stdio:'ignore'}).on('error', () => p.kill());
    } else p.kill();
  });
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
for (const p of children) {
  p.on("error", (error) => { console.error(error.message); close(); process.exitCode = 1; });
  p.on("exit", (code) => {
    close();
    if (code && !process.exitCode) process.exitCode = code;
  });

}
