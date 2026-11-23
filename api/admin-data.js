// Vercel Serverless Function: GET /api/admin-data
// Fetches platform-wide users, payments, videos, and connection status (never OAuth tokens).

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(401).json({ error: "Missing user access token." });
  }

  try {
    // Verify caller identity via Supabase Auth
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${token}`
      }
    });
    if (!userRes.ok) {
      return res.status(401).json({ error: "Invalid session." });
    }
    const caller = await userRes.json();
    const callerEmail = (caller.email || "").toLowerCase();

    if (adminEmails.length && !adminEmails.includes(callerEmail)) {
      return res.status(403).json({ error: "Admin access required." });
    }

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    };

    const [profilesRes, videosRes, paymentsRes, socialRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/profiles?select=id,full_name,email,plan,credits,created_at&order=created_at.desc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/videos?select=id,user_id,title,niche,status,created_at&order=created_at.desc&limit=50`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/payments?select=id,user_id,plan_name,credits_added,amount_inr,status,created_at&order=created_at.desc&limit=50`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/social_accounts?select=user_id,platform,account_name`, { headers })
    ]);

    const [profiles, videos, payments, socialAccounts] = await Promise.all([
      profilesRes.json(),
      videosRes.json(),
      paymentsRes.json(),
      socialRes.json()
    ]);

    return res.status(200).json({
      profiles: Array.isArray(profiles) ? profiles : [],
      videos: Array.isArray(videos) ? videos : [],
      payments: Array.isArray(payments) ? payments : [],
      socialAccounts: Array.isArray(socialAccounts) ? socialAccounts : []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
