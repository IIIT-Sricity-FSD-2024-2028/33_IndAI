import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac } from "node:crypto";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  dir = await mkdtemp(path.join(os.tmpdir(), "indai-test-")),
  port = 34839;
let child,
  log = "";
const env = {
  ...process.env,
      NODE_ENV:"test",COOKIE_SECURE:"false",UPSTOX_ANALYTICS_TOKEN:"",
  PORT: String(port),
  DATA_DIR: dir,
  JWT_SECRET: "a".repeat(64),
  JWT_REFRESH_SECRET: "b".repeat(64),
  RATE_LIMIT_SENSITIVE_MAX: "500",
  RATE_LIMIT_GENERAL_MAX: "2000",
  RAZORPAY_KEY_ID: "rzp_test_mockkey",
  RAZORPAY_KEY_SECRET: "mock-secret-value",
  RAZORPAY_WEBHOOK_SECRET: "webhook-test-value",
  DEMO_MODE: "true",SMTP_HOST:"",SMTP_FROM:"",
};
async function start() {
  child = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "back-end"),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 100; i++) {
    try {
      if (
        (await fetch(`http://127.0.0.1:${port}/api/payments/razorpay/config`))
          .ok
      )
        return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error(log);
}
async function stop() {
  if (child && !child.killed)
    await new Promise((r) => {
      child.once("exit", r);
      child.kill("SIGTERM");
    });
}
async function req(
  route,
  token,
  body,
  method = body ? "POST" : "GET",
  headers = {},
) {
  const r = await fetch(`http://127.0.0.1:${port}/api${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const p = await r.json();
  return {
    status: r.status,
    data: p.data ?? p,
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
async function login(email, password) {
  const r = await req("/auth/login", null, { email, password });
  assert.equal(r.status, 201, JSON.stringify(r));
  return { ...r.data, cookie: r.cookie };
}
await test("Role, onboarding, trading, payment and restart workflows", async (t) => {
  await start();
  try {
    let learner, admin, payment, instructor;
    await t.test(
      "Credential-only login resolves roles and divisions",
      async () => {
        learner = await login("learner@indai.com", "Learn@1234");
        admin = await login("admin@indai.com", "Admin@1234");
        payment = await login("paymentadmin@indai.com", "Pay@1234");
        instructor = await login("instructor@indai.com", "Inst@1234");
        await login("superadmin@indai.com", "Admin@1234");
        await login("provider@indai.com", "Prov@1234");
        assert.equal(learner.user.role, "learner");
        assert.equal(payment.user.adminTeam, "PAYMENT_ADMIN");
        assert.equal(
          (
            await req("/auth/login", null, {
              email: "learner@indai.com",
              password: "wrong",
            })
          ).status,
          401,
        );
      },
    );
    await t.test(
      "Refresh rotates and resource ownership is enforced",
      async () => {
        assert.equal(
          (
            await req("/auth/refresh", null, {}, "POST", {
              Cookie: learner.cookie,
            })
          ).status,
          201,
        );
        assert.equal(
          (
            await req("/auth/refresh", null, {}, "POST", {
              Cookie: learner.cookie,
            })
          ).status,
          401,
        );
        assert.equal((await req("/users")).status, 401);
        assert.equal(
          (await req("/users/u3/portfolio", learner.accessToken)).status,
          403,
        );
        assert.equal(
          (
            await req(
              "/commercial/compensation/instructors",
              payment.accessToken,
            )
          ).status,
          200,
        );
      },
    );
    await t.test(
      "Intake, CSV preview, atomic import and division authorization",
      async () => {
        const csv =
          "firstName,lastName,email,role,studentId,expertise,yearsExp\r\nJessie,Reddy,jessie-eval@example.in,learner,EVAL001,,\r\n";
        const inv = await req("/institutes/org1/invite", admin.accessToken, {
          email: "coordinator@example.in",
        });
        assert.equal(inv.status, 201, JSON.stringify(inv));
        assert.equal(inv.data.sent, false);
        const raw = inv.data.url.split("/").pop();
        assert.equal((await req("/institutes/intake/" + raw)).status, 200);
        assert.equal(
          (await req("/institutes/intake/" + raw, null, { csv })).status,
          201,
        );
        assert.equal(
          (await req("/institutes/org1/preview", admin.accessToken, { csv }))
            .data.count,
          1,
        );
        assert.equal(
          (await req("/institutes/org1/import", payment.accessToken, { csv }))
            .status,
          403,
        );
        const imported = await req(
          "/institutes/org1/import",
          admin.accessToken,
          { csv },
        );
        assert.equal(imported.status, 201, JSON.stringify(imported));
        assert.ok(imported.data.csv.includes("Ind@"));
        assert.equal(
          (await req("/institutes/org1/import", admin.accessToken, { csv }))
            .status,
          400,
        );
        assert.equal((await req("/institutes/intake/" + raw)).status, 400);
        const before = (await req("/users", admin.accessToken)).data.length;
        assert.equal(
          (
            await req("/institutes/org1/import", admin.accessToken, {
              csv: "firstName,lastName,email,role,studentId\nValid,Person,valid@example.in,learner,NEW001\nBad,Person,wrong,learner,NEW002",
            })
          ).status,
          400,
        );
        assert.equal(
          (await req("/users", admin.accessToken)).data.length,
          before,
        );
      },
    );
    await t.test(
      "Paper fills, oversell rejection, concurrent account isolation and backtest",
      async () => {
        const tok = learner.accessToken;
        assert.equal((await req("/algo/search?q=DEMO", tok)).status, 200);
        const o = await req("/algo/orders", tok, {
          key: "DEMO|RELIANCE",
          symbol: "RELIANCE",
          exchange: "DEMO",
          side: "BUY",
          type: "MARKET",
          qty: 2,
        });
        assert.equal(o.status, 200, JSON.stringify(o));
        assert.equal(o.data.order.status, "FILLED");
        const p = await Promise.all([
          req("/algo/portfolio", tok),
          req("/algo/portfolio", instructor.accessToken),
        ]);
        assert.equal(p[0].data.positions[0].qty, 2);
        assert.equal(p[1].data.positions.length, 0);
        assert.equal(
          (
            await req("/algo/orders", tok, {
              key: "DEMO|RELIANCE",
              symbol: "RELIANCE",
              exchange: "DEMO",
              side: "SELL",
              type: "MARKET",
              qty: 999,
            })
          ).status,
          400,
        );
        const b = await req("/algo/backtest", tok, {
          key: "DEMO|RELIANCE",
          strategy: "sma",
          fast: 10,
          slow: 30,
          start: "2025-01-01",
          end: "2025-12-31",
          unit: "days",
          interval: 1,
          capital: 100000,
          allocation: 95,
          feePct: 0.05,
          slippagePct: 0.03,
        });
        assert.equal(b.status, 200, JSON.stringify(b));
        assert.ok(b.data.candles > 200);
      },
    );
    await t.test(
      "Course enrollment/progress, assignment submission and session creation",
      async () => {
        const en = await req("/enrollments", learner.accessToken, {
          learnerId: "u6",
          courseId: "c3",
        });
        assert.equal(en.status, 201, JSON.stringify(en));
        assert.equal(
          (
            await req(
              "/enrollments/" + en.data.id + "/progress",
              learner.accessToken,
              { progress: 40 },
              "PATCH",
            )
          ).status,
          200,
        );
        const date = new Date(Date.now() + 86400000 * 7)
          .toISOString()
          .slice(0, 10);
        const a = await req("/assignments", instructor.accessToken, {
          title: "Evaluation task",
          description: "Write a trading plan",
          instructorId: "u3",
          studentIds: ["u6"],
          dueDate: date,
          skillPoints: 20,
          difficulty: "Medium",
        });
        assert.equal(a.status, 201, JSON.stringify(a));
        assert.equal(
          (
            await req(
              "/assignments/" + a.data.id + "/submit",
              learner.accessToken,
              { learnerId: "u6", submissionText: "My trading plan" },
            )
          ).status,
          201,
        );
        assert.equal(
          (
            await req("/sessions", instructor.accessToken, {
              title: "Evaluation session",
              instructorId: "u3",
              studentIds: ["u6"],
              date,
              time: "10:00",
              duration: 60,
            })
          ).status,
          201,
        );
      },
    );
    await t.test("Provider course assignment reaches later enrollments and approval awards points once", async () => {
      const provider = await login("provider@indai.com", "Prov@1234");
      const course = await req("/courses", provider.accessToken, {providerId:"u5",title:"Regression enrollment course",description:"Regression content",category:"Trading",lessons:1,skillPoints:20,accessTier:"FREE",quotedPrice:0});
      assert.equal(course.status,201,JSON.stringify(course));
      const courseId=course.data.id;
      const assignment=await req("/assignments",provider.accessToken,{providerId:"u5",courseId,title:"Future enrollee challenge",description:"Write your learning plan",dueDate:new Date(Date.now()+7*86400000).toISOString().slice(0,10),skillPoints:15,difficulty:"Easy"});
      assert.equal(assignment.status,201,JSON.stringify(assignment));
      const quiz=await req("/quizzes",provider.accessToken,{providerId:"u5",courseId,title:"Regression course quiz",questions:[{q:"Paper trading uses?",options:["Virtual funds","Real funds"],ans:0}]});
      assert.equal(quiz.status,201,JSON.stringify(quiz));
      assert.ok(!(await req("/quizzes",learner.accessToken)).data.some(q=>q.id===quiz.data.id));
      assert.equal((await req("/commercial/courses/"+courseId+"/approve",payment.accessToken,{sanctionedAmount:0})).status,201);
      assert.equal((await req("/enrollments",learner.accessToken,{learnerId:"u6",courseId})).status,201);
      assert.ok((await req("/assignments/learner/u6",learner.accessToken)).data.some(a=>a.id===assignment.data.id));
      assert.equal((await req("/assignments/"+assignment.data.id+"/submit",learner.accessToken,{learnerId:"u6",submissionText:"My completed learning plan"})).status,201);
      const before=(await req("/auth/me",learner.accessToken)).data.skillPoints;
      for(let i=0;i<2;i++)assert.equal((await req("/assignments/"+assignment.data.id+"/approve/u6",provider.accessToken,{})).status,201);
      assert.equal((await req("/auth/me",learner.accessToken)).data.skillPoints,before+15);
      const invalid=await req("/quizzes/"+quiz.data.id,provider.accessToken,{questions:[{q:"Invalid?",options:["A","B"],ans:-1}]},"PATCH");assert.equal(invalid.status,400);
      assert.equal((await req("/quizzes/"+quiz.data.id+"/submit",learner.accessToken,{learnerId:"u6",answers:[0]})).data.score,1);
      assert.equal((await req("/quizzes",provider.accessToken)).data.find(q=>q.id===quiz.data.id).attempts.length,1);
    });
    await t.test(
      "Payment signature rejection and captured webhook idempotency",
      async () => {
        await stop();
        const file = path.join(dir, "platform.json");
        const state = JSON.parse(await readFile(file, "utf8"));
        state.paymentIntents.push({
          id: "mock",
          purpose: "PRO_SUBSCRIPTION",
          subjectId: "u6",
          planId: "pro_monthly",
          orderId: "order_eval",
          amount: 299,
          status: "CREATED",
        });
        await writeFile(file, JSON.stringify(state));
        await start();
        learner = await login("learner@indai.com", "Learn@1234");
        assert.equal(
          (
            await req("/payments/razorpay/pro/verify", learner.accessToken, {
              userId: "u6",
              planId: "pro_monthly",
              razorpay_order_id: "order_eval",
              razorpay_payment_id: "pay_eval",
              razorpay_signature: "bad",
            })
          ).status,
          400,
        );
        const event = {
            event: "payment.captured",
            payload: {
              payment: {
                entity: {
                  id: "pay_eval",
                  order_id: "order_eval",
                  amount: 29900,
                  currency: "INR",
                  status: "captured",
                },
              },
            },
          },
          sig = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(event))
            .digest("hex");
        for (let i = 0; i < 2; i++)
          assert.equal(
            (
              await req("/payments/razorpay/webhook", null, event, "POST", {
                "x-razorpay-signature": sig,
              })
            ).status,
            201,
          );
        assert.equal(
          (await req("/commercial/subscriptions/user/u6", learner.accessToken))
            .data.tier,
          "PRO",
        );
        const saved = JSON.parse(await readFile(file, "utf8"));
        assert.equal(
          saved.transactions.filter((x) => x.razorpayPaymentId === "pay_eval")
            .length,
          1,
        );
      },
    );
    await t.test(
      "PDF upload uses a relative URL on persistent storage and checks course ownership",
      async () => {
        const provider = await login("provider@indai.com", "Prov@1234");
        async function upload(courseId) {
          const form = new FormData();
          form.append(
            "pdf",
            new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" }),
            "evaluation.pdf",
          );
          form.append("courseId", courseId);
          form.append("title", "Evaluation PDF");
          return fetch(
            `http://127.0.0.1:${port}/api/course-modules/upload-pdf`,
            {
              method: "POST",
              headers: { Authorization: "Bearer " + provider.accessToken },
              body: form,
            },
          );
        }
        const denied = await upload("c3");
        assert.equal(denied.status, 403);
        const r = await upload("c1"),
          p = await r.json();
        assert.equal(r.status, 201, JSON.stringify(p));
        assert.ok(p.data.url.startsWith("/uploads/materials/"));
        assert.equal(
          (await fetch(`http://127.0.0.1:${port}` + p.data.url)).status,
          200,
        );
      },
    );
    await t.test(
      "Imported accounts, paper fills and subscription survive restart",
      async () => {
        await stop();
        await start();
        admin = await login("admin@indai.com", "Admin@1234");
        learner = await login("learner@indai.com", "Learn@1234");
        assert.ok(
          (await req("/users", admin.accessToken)).data.some(
            (u) => u.email === "jessie-eval@example.in",
          ),
        );
        assert.equal(
          (await req("/algo/portfolio", learner.accessToken)).data.positions[0]
            .qty,
          2,
        );
        assert.equal(
          (await req("/commercial/subscriptions/user/u6", learner.accessToken))
            .data.tier,
          "PRO",
        );
      },
    );
  } finally {
    await stop();
    await rm(dir, { recursive: true, force: true });
  }
});
