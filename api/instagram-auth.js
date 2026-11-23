// Vercel Serverless Function: GET /api/instagram-auth
// Handles Meta OAuth 2.0 authorization URL generation and callback token exchange for Instagram Graph API.

export default async function handler(req, res) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return res.status(500).json({
      error: "Meta OAuth environment variables (META_APP_ID, META_APP_SECRET, INSTAGRAM_REDIRECT_URI) are not configured."
    });
  }

  const action = req.query.action || "url";

  if (action === "url") {
    const scopes = [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "pages_show_list"
    ].join(",");

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code"
    });

    return res.status(200).json({
      authUrl: `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`
    });
  }

  if (action === "callback") {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send("Missing Meta OAuth authorization code.");
    }

    try {
      const tokenParams = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code
      });

      const tokenRes = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${tokenParams.toString()}`);
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return res.status(400).json(tokenData);
      }

      res.setHeader(
        "Set-Cookie",
        `ig_access_token=${encodeURIComponent(tokenData.access_token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${tokenData.expires_in || 5184000}`
      );
      return res.redirect("/dashboard.html?ig_connected=1");
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Invalid action" });
}
