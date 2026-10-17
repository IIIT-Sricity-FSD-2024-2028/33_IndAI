const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
(async () => {
  const root = path.resolve(__dirname, ".."),
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "indai-home-")),
    port = 34844;
  const server = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "back-end"),
    env: {
      ...process.env,
      NODE_ENV: "test",
      COOKIE_SECURE: "false",
      PORT: String(port),
      DATA_DIR: dir,
      DEMO_MODE: "true",
      UPSTOX_ANALYTICS_TOKEN: "",
      RAZORPAY_KEY_ID: "",
      RAZORPAY_KEY_SECRET: "",
      RAZORPAY_PAYMENT_LINK: "https://razorpay.me/@reddemjeswanthreddy",
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
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/`);
    await page
      .getByRole("heading", { name: /Trade Smarter|Learn Trading|Learn/i })
      .first()
      .waitFor();
    const reveals = page.locator(".reveal");
    if (!(await reveals.count())) throw Error("Reveal sections missing");
    for (let i = 0; i < (await reveals.count()); i++) {
      await reveals.nth(i).scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (el) => getComputedStyle(el).opacity === "1",
        await reveals.nth(i).elementHandle(),
        { timeout: 5000 },
      );
    }
    console.log("PASS Every homepage reveal section becomes visible");
    await page.locator(".faq-q").first().click();
    await page.waitForFunction(
      () =>
        document.querySelector(".faq-a").classList.contains("open") &&
        document.querySelector(".faq-a").getBoundingClientRect().height > 10,
    );
    await page.locator(".faq-q").nth(1).click();
    if ((await page.locator(".faq-a.open").count()) !== 1)
      throw Error("FAQ accordion should have one answer open");
    console.log("PASS FAQ answers expand and collapse");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#c-name").fill("Homepage Tester");
    await page.locator("#c-email").fill("homepage@example.in");
    await page
      .locator("#c-message")
      .fill("Testing the homepage contact form end to end.");
    await page
      .getByRole("button", { name: "Send Message", exact: true })
      .click();
    await page
      .getByText("Thank you. Your message has been received.", { exact: true })
      .waitFor();
    if ((await page.locator("#c-name").inputValue()) !== "")
      throw Error("Contact form not reset");
    console.log("PASS Homepage contact submission and feedback");
    await page.goto(`http://127.0.0.1:${port}/index.html`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 2,
    );
    if (overflow) {
      console.log(
        await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .map((e) => ({
              tag: e.tagName,
              cl: e.className,
              x: e.getBoundingClientRect().left,
              right: e.getBoundingClientRect().right,
              width: e.getBoundingClientRect().width,
            }))
            .filter((e) => e.right > innerWidth + 2)
            .slice(0, 15),
        ),
      );
      throw Error("Mobile homepage overflows horizontally");
    }
    console.log("PASS Homepage /index.html and mobile width");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.locator("#home-nav-links").waitFor({ state: "visible" });
    await page.locator('#home-nav-links a[href="#faq"]').click();
    await page.locator("#home-nav-links").waitFor({ state: "hidden" });
    console.log(
      "PASS Mobile navigation opens and closes after selecting a section",
    );
    await page.goto(`http://127.0.0.1:${port}/login.html`);
    await page.locator("#email").fill("learner@indai.com");
    await page.locator("#password").fill("Learn@1234");
    await page.locator("#login-btn").click();
    await page.waitForURL("**/learner-dashboard.html");
    await page.locator("#tab-subscription").click();
    const link = page.getByRole("link", {
      name: /Open your Razorpay payment page/,
    });
    await link.waitFor();
    if (
      (await link.getAttribute("href")) !==
      "https://razorpay.me/@reddemjeswanthreddy"
    )
      throw Error("Hosted payment page missing");
    await page.getByText("Razorpay API keys needed", { exact: true }).waitFor();
    console.log(
      "PASS Hosted Razorpay URL is available without claiming automatic activation",
    );
    if (errors.length) throw Error(errors.join("; "));
  } finally {
    await browser?.close();
    await new Promise((r) => {
      server.once("exit", r);
      server.kill();
    });
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
