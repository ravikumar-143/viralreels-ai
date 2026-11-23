// Vercel Serverless Function: POST /api/generate-voice
// Keeps ELEVENLABS_API_KEY strictly on the server side.

const VOICE_IDS = {
  adam: "pNInz6obpgDQGcFmaJgB",
  rachel: "21m00Tcm4TlvDq8ikWAM",
  antoni: "ErXwobaYiN019PkySvjV",
  bella: "EXAVITQu4vr4xnSDxMaL"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured on the server." });
  }

  try {
    const { text, voice = "adam" } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: "Narration text is required." });
    }

    const voiceId = VOICE_IDS[voice] || VOICE_IDS.adam;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "ElevenLabs error", details: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    return res.status(200).json({
      audioDataUrl: `data:audio/mpeg;base64,${base64Audio}`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to generate voiceover" });
  }
}
