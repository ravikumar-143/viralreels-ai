# ViralReels AI — Phase 5 Setup (YouTube Integration)

## 1. Enable YouTube Data API v3 in Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create/select a project.
2. Enable **YouTube Data API v3**.
3. Under **APIs & Services -> Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add your Authorized Redirect URI:
   `https://your-vercel-domain.vercel.app/api/youtube-auth?action=callback`

## 2. Add Environment Variables in Vercel
In **Vercel -> Project Settings -> Environment Variables**, add:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI`

## 3. Deploy Files
Copy `api/youtube-auth.js`, `api/youtube-channel.js`, `api/youtube-upload.js`, `js/youtube-manager.js`, `.env.example`, and the updated `dashboard.html` + `js/dashboard.js` into your `viralreels-ai/` repository and push to GitHub.
