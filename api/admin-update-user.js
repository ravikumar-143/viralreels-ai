// Vercel Serverless Function: POST /api/admin-update-user
// Allows an authenticated admin to update a user's credits or subscription plan.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Supabase service credentials are not configured." });
  }

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` }
    });
    if (!userRes.ok) return res.status(401).json({ error: "Invalid session." });
    const caller = await userRes.json();

    if (adminEmails.length && !adminEmails.includes((caller.email || "").toLowerCase())) {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { userId, credits, plan } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const patch = {};
    if (typeof credits === "number") patch.credits = credits;
    if (plan) patch.plan = plan;

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(patch)
    });

    const updated = await updateRes.json();
    return res.status(updateRes.ok ? 200 : 400).json({ updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
