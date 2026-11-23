# ViralReels AI — Phase 6 Setup (Instagram Integration)

## 1. Create a Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/) and create an app.
2. Add **Instagram Graph API** and **Facebook Login for Business**.
3. Ensure your Instagram account is a **Professional (Business or Creator)** account linked to a Facebook Page.
4. Add your Valid OAuth Redirect URI:
   `https://your-vercel-domain.vercel.app/api/instagram-auth?action=callback`

## 2. Add Environment Variables in Vercel
In **Vercel -> Project Settings -> Environment Variables**, add:
- `META_APP_ID`
- `META_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI`

## 3. Deploy Files
Copy `api/instagram-auth.js`, `api/instagram-account.js`, `api/instagram-publish.js`, `js/instagram-manager.js`, `.env.example`, and the updated `dashboard.html` into your `viralreels-ai/` repository and push to GitHub.
