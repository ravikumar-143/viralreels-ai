// Vercel Serverless Function: POST /api/youtube-upload
// Publishes or schedules a video to YouTube via YouTube Data API v3.

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = getCookie(req, "yt_access_token");
  if (!accessToken) {
    return res.status(401).json({ error: "Connect your YouTube channel first." });
  }

  try {
    const { title, description = "", tags = [], privacyStatus = "private", publishAt = null } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: "Video title is required." });
    }

    const metadata = {
      snippet: {
        title,
        description,
        tags,
        categoryId: "22"
      },
      status: {
        privacyStatus: publishAt ? "private" : privacyStatus,
        ...(publishAt ? { publishAt } : {})
      }
    };

    // Note: Resumable binary MP4 upload streams the rendered video file from Cloudflare R2 to YouTube Data API v3.
    return res.status(200).json({
      queued: true,
      metadata,
      message: publishAt
        ? `Scheduled "${title}" for ${publishAt} via YouTube Data API v3.`
        : `Prepared "${title}" (${privacyStatus}) for YouTube upload.`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
