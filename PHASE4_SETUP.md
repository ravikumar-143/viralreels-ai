# ViralReels AI — Phase 4 Setup (AI Video Generator & Serverless APIs)

## 1. Add Files to Your Repository
Copy these files into your `viralreels-ai/` project:
- `api/generate-script.js`
- `api/generate-voice.js`
- `api/generate-video.js`
- `css/studio.css`
- `js/video-generator.js`
- Updated `dashboard.html` and `js/dashboard.js`
- `vercel.json` and `.env.example`

## 2. Add Server-Side API Keys in Vercel
Never put AI API keys in frontend JavaScript. In **Vercel -> Project Settings -> Environment Variables**, add:
- `OPENAI_API_KEY` (for `api/generate-script.js`)
- `ELEVENLABS_API_KEY` (for `api/generate-voice.js`)
- `VIDEO_PROVIDER_API_KEY` (for `api/generate-video.js`)

## 3. Deploy & Test
Push to GitHub and Vercel will deploy both your static frontend and `/api/*` Node.js serverless functions. If API keys are not set yet, the studio automatically falls back to Demo Preview mode so you can still test the full workflow.
