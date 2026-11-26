const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "indai-actions-")),
    root = path.resolve(__dirname, ".."),
    port = 34842;
  const server = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "back-end"),
    env: {
      ...process.env,
      NODE_ENV: "test",
      COOKIE_SECURE: "false",
      UPSTOX_ANALYTICS_TOKEN: "",
      PORT: String(port),
      DATA_DIR: dir,
      DEMO_MODE: "true",
      RATE_LIMIT_SENSITIVE_MAX: "1000",
      RATE_LIMIT_GENERAL_MAX: "5000",
    },
    stdio: "ignore",
  });
  let browser;
  try {
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    browser = await chromium.launch({
      ...(process.env.CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
        : {}),
      args: ["--no-sandbox"],
      headless: true,
    });
    const p = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/register.html`);
    await p.getByRole("button", { name: "Next Step" }).click();
    for (const [id, value] of [
      ["reg-first", "Jessie"],
      ["reg-last", "Reddy"],
      ["reg-email", "react-register@example.in"],
      ["reg-phone", "9876543210"],
      ["reg-dob", "2007-05-09"],
    ])
      await p.locator("#" + id).fill(value);
    await p.getByRole("button", { name: "Next Step" }).click();
    await p.locator("#reg-institution").fill("Evaluation Institute");
    await p.locator("#reg-studentid").fill("REACT001");
    await p.locator("#reg-grade").fill("Second Year");
    await p.getByRole("button", { name: "Next Step" }).click();
    await p.locator("#reg-pw").fill("Eval@12345");
    await p.locator("#reg-pw2").fill("Eval@12345");
    await p.getByRole("button", { name: "Next Step" }).click();
    await p.locator("#reg-terms").check();
    await p.locator("#reg-understand").check();
    await p.locator("#submit-btn").click();
    await p.waitForTimeout(500);
    if (!(await p.getByText("Account created", { exact: true }).count()))
      throw Error(
        "Registration failed: " + (await p.locator("body").innerText()),
      );
    console.log("PASS React registration wizard creates account");
    await p.goto(`http://127.0.0.1:${port}/login.html`);
    await p.locator("#email").fill("react-register@example.in");
    await p.locator("#password").fill("Eval@12345");
    await p.locator("#login-btn").click();
    await p.waitForURL("**/learner-dashboard.html");
    await p.locator("#tab-trading").click();
    await p.waitForTimeout(500);
    await p.locator("#trade-quantity").first().fill("1");
    await p
      .getByRole("button", { name: "Place virtual BUY", exact: true })
      .click();
    await p.waitForTimeout(400);
    await p.locator("#tab-portfolio").click();
    await p.waitForTimeout(500);
    if (!(await p.getByText("RELIANCE", { exact: true }).count()))
      throw Error("Research portfolio not synchronized");
    console.log("PASS React trading and portfolio synchronization");
    await p.getByRole("button", { name: "Logout", exact: true }).click();
    await p.waitForURL("**/login.html");
    await p.locator("#email").fill("provider@indai.com");
    await p.locator("#password").fill("Prov@1234");
    await p.locator("#login-btn").click();
    await p.waitForURL("**/provider-dashboard.html");
    await p.getByRole("button", { name: "+ New Course", exact: true }).click();
    for (const [id, value] of [
      ["title", "React Evaluation Course"],
      ["description", "This is a working React course form."],
      ["category", "Fundamentals"],
    ])
      await p.locator("#field-" + id).fill(value);
    await p.getByRole("button", { name: "Save", exact: true }).click();
    await p.waitForTimeout(400);
    if (
      !(await p.getByText("React Evaluation Course", { exact: true }).count())
    )
      throw Error("Course not created");
    console.log("PASS React course controlled form and mutation");
    console.log("Page errors:", errors);
    if (errors.length) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
