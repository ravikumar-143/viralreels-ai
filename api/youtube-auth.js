// Vercel Serverless Function: GET /api/youtube-auth
// Handles Google OAuth 2.0 authorization URL generation and callback token exchange.

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({
      error: "Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, YOUTUBE_REDIRECT_URI) are not configured."
    });
  }

  const action = req.query.action || "url";

  if (action === "url") {
    const scopes = [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly"
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent"
    });

    return res.status(200).json({
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    });
  }

  if (action === "callback") {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send("Missing OAuth authorization code.");
    }

    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return res.status(400).json(tokenData);
      }

      // Store access_token securely in an HttpOnly cookie for session-scoped YouTube API calls
      res.setHeader(
        "Set-Cookie",
        `yt_access_token=${encodeURIComponent(tokenData.access_token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${tokenData.expires_in || 3600}`
      );
      return res.redirect("/dashboard.html?yt_connected=1");
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Invalid action" });
}
