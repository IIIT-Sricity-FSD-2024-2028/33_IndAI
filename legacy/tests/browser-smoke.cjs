const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "indai-ui-"));
  const root = path.resolve(__dirname, "..");
  const port = 34840;
  const server = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "back-end"),
    env: {
      ...process.env,
      NODE_ENV:"test",COOKIE_SECURE:"false",UPSTOX_ANALYTICS_TOKEN:"",
      PORT: String(port),
      DATA_DIR: dir,
      RATE_LIMIT_SENSITIVE_MAX: "1000",
      RATE_LIMIT_GENERAL_MAX: "5000",
      DEMO_MODE: "true",
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
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const results = [];
    for (const [role, email, password] of [
      ["learner", "learner@indai.com", "Learn@1234"],
      ["instructor", "instructor@indai.com", "Inst@1234"],
      ["provider", "provider@indai.com", "Prov@1234"],
      ["admin", "admin@indai.com", "Admin@1234"],
      ["payment", "paymentadmin@indai.com", "Pay@1234"],
      ["superuser", "superadmin@indai.com", "Admin@1234"],
    ]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      const page = await context.newPage();
      const errors = [],
        apiFailures = [],
        warnings = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") warnings.push(msg.text().slice(0, 250));
      });
      page.on("response", (r) => {
        if (r.status() >= 400 && r.url().includes("/api/"))
          apiFailures.push(r.status() + " " + r.url().split("/api/")[1]);
      });
      await page.goto(`http://127.0.0.1:${port}/login.html`);
      if (await page.locator("#role").count())
        errors.push("Login still has role selector");
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(password);
      await page.locator("#login-btn").click();
      await page.waitForURL("**/*dashboard.html", { timeout: 15000 });
      await page.waitForTimeout(700);
      const tabs = page.locator(".tab-btn,.tab-nav-btn");
      const count = await tabs.count();
      for (let i = 0; i < count; i++) {
        if (!(await tabs.nth(i).isVisible())) continue;
        await tabs.nth(i).click();
        await page.waitForTimeout(200);
        if ((await page.getByText("Unable to display this screen").count()) > 0)
          errors.push("Error boundary on tab " + i);
      }
      if (role === "learner") {
        await page.locator("#tab-trading").click();
        await page.waitForTimeout(500);
      }
      results.push({
        role,
        url: page.url(),
        errors,
        apiFailures: [...new Set(apiFailures)],
        warnings: [...new Set(warnings)],
      });
      await context.close();
    }
    console.log(JSON.stringify(results, null, 2));
    if (
      results.some(
        (r) => r.errors.length || r.apiFailures.length || r.warnings.length,
      )
    )
      throw Error("Browser smoke check found errors; see results above.");
  } finally {
    await browser?.close();
    server.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
