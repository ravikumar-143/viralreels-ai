// Vercel Serverless Function: POST /api/generate-script
// Keeps OPENAI_API_KEY strictly on the server side.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  try {
    const { topic, niche = "History", durationSec = 45 } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const prompt = `Write a high-retention ${durationSec}-second faceless short-form video script in the "${niche}" niche about: "${topic}".
Return valid JSON with keys:
- "title": catchy short title
- "hook": opening 1-sentence hook
- "narration": full spoken voiceover script (approx ${Math.round(durationSec * 2.4)} words)
- "scenes": array of 4 objects, each with "caption" and "visualPrompt"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a viral short-form video scriptwriter. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.75
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "OpenAI error", details: errText });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to generate script" });
  }
}
