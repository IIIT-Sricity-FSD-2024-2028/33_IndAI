import * as fs from "fs";
import * as path from "path";
// Prefer the backend's private file regardless of the shell's working directory.
const candidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
];
const file = candidates.find((file) => fs.existsSync(file));
if (file)
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    const i = text.indexOf("=");
    if (i < 1) continue;
    const key = text.slice(0, i).trim();
    let value = text.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
