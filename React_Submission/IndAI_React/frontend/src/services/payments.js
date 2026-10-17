import { api } from "./api";
let script;
async function loadCheckout() {
  if (window.Razorpay) return;
  if (!script)
    script = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = resolve;
      s.onerror = () => {
        script = null;
        reject(
          Error(
            "Unable to load Razorpay checkout. Check your internet connection.",
          ),
        );
      };
      document.head.appendChild(s);
    });
  await script;
}
export async function checkout({ user, planId, organization, amount }) {
  const config = await api("/payments/razorpay/config");
  if (!config.configured)
    throw Error("Configure Razorpay test keys in back-end/.env first.");
  await loadCheckout();
  const base = organization
    ? "/payments/razorpay/b2b/" + organization.id
    : "/payments/razorpay/pro";
  const body = organization
    ? { amount: Number(amount) }
    : { userId: user.id, planId };
  const order = await api(base + "/order", "POST", body);
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      prefill: order.prefill || { name: user.firstName, email: user.email },
      theme: { color: "#2563eb" },
      handler: async (response) => {
        try {
          resolve(
            await api(base + "/verify", "POST", { ...body, ...response }),
          );
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(Error("Payment was cancelled.")) },
    });
    rzp.on("payment.failed", (r) =>
      reject(Error(r.error?.description || "Payment failed.")),
    );
    rzp.open();
  });
}
