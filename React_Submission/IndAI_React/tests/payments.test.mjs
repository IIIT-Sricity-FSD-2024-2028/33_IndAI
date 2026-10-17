import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";
const require = createRequire(import.meta.url),
  {
    PaymentsService,
  } = require("../back-end/dist/modules/payments/payments.service.js");
process.env.RAZORPAY_KEY_ID = "rzp_test_mockkey";
process.env.RAZORPAY_KEY_SECRET = "unit-payment-secret";
function fixture() {
  const user = {
      id: "learner-test",
      role: "learner",
      status: "active",
      subscriptionTier: "FREE",
    },
    db = {
      users: [user],
      paymentIntents: [
        {
          orderId: "order_unit",
          purpose: "PRO_SUBSCRIPTION",
          subjectId: user.id,
          planId: "pro_monthly",
          amount: 299,
          status: "CREATED",
        },
      ],
      subscriptionPlans: [
        {
          id: "pro_monthly",
          name: "Pro Monthly",
          code: "PRO",
          price: 299,
          days: 30,
        },
      ],
      subscriptions: [],
      transactions: [],
      notifications: [],
      getUser: (id) => (id === user.id ? user : null),
      id: (p) => p + Math.random(),
      audit: () => {},
    };
  return { user, db, service: new PaymentsService(db) };
}
const response = {
  userId: "learner-test",
  planId: "pro_monthly",
  razorpay_order_id: "order_unit",
  razorpay_payment_id: "pay_unit",
  razorpay_signature: createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update("order_unit|pay_unit")
    .digest("hex"),
};
await test("Valid checkout signature activates only a captured matching payment and is idempotent", async () => {
  const { db, service } = fixture(),
    prior = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        id: "pay_unit",
        order_id: "order_unit",
        status: "captured",
        amount: 29900,
        currency: "INR",
      }),
      { status: 200 },
    );
  try {
    const r = await service.verifyProPayment(response, "learner-test");
    assert.equal(r.tier, "PRO");
    assert.equal(db.transactions.length, 1);
    await service.verifyProPayment(response, "learner-test");
    assert.equal(db.transactions.length, 1);
  } finally {
    globalThis.fetch = prior;
  }
});
await test("Authorized but uncaptured or wrong-amount payment cannot grant access", async () => {
  for (const payment of [
    { status: "authorized", amount: 29900 },
    { status: "captured", amount: 100 },
  ]) {
    const { db, service } = fixture(),
      prior = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ order_id: "order_unit", currency: "INR", ...payment }),
        { status: 200 },
      );
    try {
      await assert.rejects(
        service.verifyProPayment(response, "learner-test"),
        /not captured/,
      );
      assert.equal(db.transactions.length, 0);
      assert.equal(db.users[0].subscriptionTier, "FREE");
    } finally {
      globalThis.fetch = prior;
    }
  }
});
