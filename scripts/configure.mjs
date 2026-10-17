import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
if (Number(process.versions.node.split('.')[0]) !== 24) {
  console.error('IndAI requires Node.js 24 LTS. Install Node 24 and reopen your terminal.');
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  target = path.join(root, "back-end", ".env");
if (fs.existsSync(target)) {
  console.log("Existing back-end/.env retained.");
} else {
  let text = fs.readFileSync(
    path.join(root, "back-end", ".env.example"),
    "utf8",
  );
  text = text
    .replace(
      /^JWT_SECRET=.*$/m,
      "JWT_SECRET=" + crypto.randomBytes(48).toString("hex"),
    )
    .replace(
      /^JWT_REFRESH_SECRET=.*$/m,
      "JWT_REFRESH_SECRET=" + crypto.randomBytes(48).toString("hex"),
    )
    .replace(
      /^ADMIN_REGISTRATION_CODE=.*$/m,
      "ADMIN_REGISTRATION_CODE=" + crypto.randomBytes(12).toString("hex"),
    );
  fs.writeFileSync(target, text, { mode: 0o600, flag: "wx" });
  console.log(
    "Created back-end/.env with random authentication secrets. Add your payment, analytics and mail settings there.",
  );
}
