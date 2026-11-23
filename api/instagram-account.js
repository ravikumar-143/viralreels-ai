// Vercel Serverless Function: GET /api/instagram-account
// Fetches the connected Instagram Professional account via Meta Graph API.

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", "ig_access_token=; Path=/; HttpOnly; Max-Age=0");
    return res.status(200).json({ disconnected: true });
  }

  const accessToken = getCookie(req, "ig_access_token");
  if (!accessToken) {
    return res.status(401).json({ connected: false, error: "Instagram account not connected." });
  }

  try {
    const pagesRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,username,profile_picture_url,followers_count,media_count}&access_token=${encodeURIComponent(accessToken)}`
    );
    const pagesData = await pagesRes.json();
    const igAccount = pagesData.data?.find((p) => p.instagram_business_account)?.instagram_business_account;

    if (!igAccount) {
      return res.status(404).json({
        connected: false,
        error: "No Instagram Professional (Business/Creator) account linked to your Facebook Page."
      });
    }

    return res.status(200).json({
      connected: true,
      igUserId: igAccount.id,
      username: igAccount.username,
      profilePicture: igAccount.profile_picture_url || "",
      followers: Number(igAccount.followers_count || 0),
      mediaCount: Number(igAccount.media_count || 0)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
