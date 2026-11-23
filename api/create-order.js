// Vercel Serverless Function: POST /api/create-order
// Creates a Razorpay order on the server side.

const PLANS = {
  Creator: { amountInr: 999, credits: 50 },
  Pro: { amountInr: 2499, credits: 150 },
  Agency: { amountInr: 5999, credits: 500 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys are not configured on the server." });
  }

  try {
    const { planName } = req.body || {};
    const plan = PLANS[planName];
    if (!plan) {
      return res.status(400).json({ error: "Invalid subscription plan selected." });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: plan.amountInr * 100, // Razorpay expects paise
        currency: "INR",
        receipt: `vr_${Date.now()}`,
        notes: { planName, credits: plan.credits }
      })
    });

    const order = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(order);
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planName,
      credits: plan.credits
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
