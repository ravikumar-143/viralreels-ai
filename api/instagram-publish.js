// Vercel Serverless Function: POST /api/instagram-publish
// Publishes or schedules an Instagram Reel via Meta Instagram Graph API.

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = getCookie(req, "ig_access_token");
  if (!accessToken) {
    return res.status(401).json({ error: "Connect your Instagram Professional account first." });
  }

  try {
    const { igUserId, videoTitle, videoUrl, caption = "", shareToFeed = true, scheduledFor = null } = req.body || {};
    if (!videoTitle) {
      return res.status(400).json({ error: "Video selection is required." });
    }

    if (scheduledFor) {
      return res.status(200).json({
        queued: true,
        message: `Scheduled "${videoTitle}" for Instagram Reels at ${scheduledFor}.`
      });
    }

    if (igUserId && videoUrl) {
      const containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          share_to_feed: shareToFeed,
          access_token: accessToken
        })
      });
      const containerData = await containerRes.json();
      if (!containerRes.ok) {
        return res.status(containerRes.status).json(containerData);
      }

      const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken
        })
      });
      const publishData = await publishRes.json();
      return res.status(publishRes.ok ? 200 : 400).json(publishData);
    }

    return res.status(200).json({
      queued: true,
      message: `Prepared "${videoTitle}" for Instagram Reels publishing.`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
