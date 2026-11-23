// Vercel Serverless Function: GET /api/youtube-channel
// Fetches authenticated user's YouTube channel stats via YouTube Data API v3.

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", "yt_access_token=; Path=/; HttpOnly; Max-Age=0");
    return res.status(200).json({ disconnected: true });
  }

  const accessToken = getCookie(req, "yt_access_token");
  if (!accessToken) {
    return res.status(401).json({ connected: false, error: "YouTube account not connected." });
  }

  try {
    const ytRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const data = await ytRes.json();
    if (!ytRes.ok || !data.items || !data.items.length) {
      return res.status(ytRes.status || 404).json({ connected: false, error: "No YouTube channel found." });
    }

    const ch = data.items[0];
    return res.status(200).json({
      connected: true,
      channelId: ch.id,
      title: ch.snippet.title,
      thumbnail: ch.snippet.thumbnails?.default?.url || "",
      subscribers: Number(ch.statistics.subscriberCount || 0),
      views: Number(ch.statistics.viewCount || 0),
      videoCount: Number(ch.statistics.videoCount || 0)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
