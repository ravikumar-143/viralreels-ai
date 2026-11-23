// Vercel Serverless Function: POST /api/verify-payment
// Verifies Razorpay HMAC-SHA256 payment signature securely on the server.

import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: "RAZORPAY_KEY_SECRET is not configured." });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, error: "Invalid payment signature." });
    }

    return res.status(200).json({ verified: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
