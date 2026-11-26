import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await test("SMTP sink receives intake and generated credentials, and the emailed password authenticates", async () => {
  const messages = [],
    sockets = new Set();
  const smtp = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.write("220 localhost ESMTP\r\n");
    let buffer = "",
      data = false,
      message = "";
    socket.on("data", (chunk) => {
      buffer += chunk;
      let i;
      while ((i = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, i);
        buffer = buffer.slice(i + 2);
        if (data) {
          if (line === ".") {
            messages.push(message);
            message = "";
            data = false;
            socket.write("250 accepted\r\n");
          } else message += line.replace(/^\.\./, ".") + "\r\n";
        } else if (/^EHLO|^HELO/.test(line))
          socket.write("250-localhost\r\n250 SIZE 10485760\r\n");
        else if (line === "DATA") {
          data = true;
          socket.write("354 Send message\r\n");
        } else if (line === "QUIT") {
          socket.end("221 bye\r\n");
        } else socket.write("250 ok\r\n");
      }
    });
  });
  await new Promise((r) => smtp.listen(0, "127.0.0.1", r));
  const dir = await mkdtemp(path.join(os.tmpdir(), "indai-mail-")),
    port = 34843;
  const child = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "back-end"),
    env: {
      ...process.env,
      NODE_ENV:"test",COOKIE_SECURE:"false",UPSTOX_ANALYTICS_TOKEN:"",
      PORT: String(port),
      DATA_DIR: dir,
      DEMO_MODE: "true",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: String(smtp.address().port),
      SMTP_FROM: "noreply@example.in",
      SMTP_USER: "",
      SMTP_PASS: "",
      PUBLIC_URL: `http://127.0.0.1:${port}`,
      RATE_LIMIT_SENSITIVE_MAX: "100",
    },
    stdio: "ignore",
  });
  async function request(route, body, token) {
    const r = await fetch(`http://127.0.0.1:${port}/api${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(body),
    });
    const p = await r.json();
    assert.ok(r.ok, JSON.stringify(p));
    return p.data;
  }
  try {
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    const admin = await request("/auth/login", {
        email: "admin@indai.com",
        password: "Admin@1234",
      }),
      token = admin.accessToken;
    const invite = await request(
      "/institutes/org1/invite",
      { email: "coordinator@example.in" },
      token,
    );
    assert.equal(invite.sent, true);
    assert.equal(messages.length, 1);
    assert.ok(messages[0].includes("/institute-intake/"));
    const csv =
      "firstName,lastName,email,role,studentId\nJessie,Reddy,smtp-eval@example.in,learner,MAIL001";
    const imported = await request("/institutes/org1/import", { csv }, token);
    const sent = await request(
      "/institutes/org1/email-credentials",
      { userIds: imported.userIds },
      token,
    );
    assert.equal(sent.sent, true);
    assert.equal(messages.length, 2);
    const attachment = messages[1]
      .split(/--[^\r\n]+\r\n/)
      .find((x) => x.includes("Content-Disposition: attachment"));
    assert.ok(attachment);
    const payload = attachment.slice(attachment.indexOf("\r\n\r\n") + 4).trim();
    const text = Buffer.from(payload.replace(/\s/g, ""), "base64").toString(
      "utf8",
    );
    const password = text.match(/"(Ind@[a-f0-9]+)"/)?.[1];
    assert.ok(password, "Generated password should be in the CSV attachment");
    const learner = await request("/auth/login", {
      email: "smtp-eval@example.in",
      password,
    });
    assert.equal(learner.user.role, "learner");
  } finally {
    await new Promise((r) => {
      child.once("exit", r);
      child.kill();
    });
    for (const s of sockets) s.destroy();
    await new Promise((r) => smtp.close(r));
    await rm(dir, { recursive: true, force: true });
  }
});
