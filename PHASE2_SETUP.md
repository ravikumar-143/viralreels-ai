# ViralReels AI — Phase 2 Setup (Login, Signup & Dashboard)

## 1. Merge into your Phase 1 folder
Copy these files into your existing `viralreels-ai/` repository, preserving the folder structure:
- `login.html`
- `signup.html`
- `dashboard.html`
- `css/auth.css`
- `css/dashboard.css`
- `js/config.js`
- `js/auth.js`
- `js/dashboard.js`

Update your Phase 1 `index.html` navigation buttons (`Log In` -> `login.html`, `Get Started` / `Sign Up` -> `signup.html`).

## 2. Connect Supabase Authentication
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **Project Settings -> API** and copy your **Project URL** and **anon public** key.
3. Paste them into `js/config.js`:
   ```js
   SUPABASE_URL: "https://your-project-id.supabase.co",
   SUPABASE_ANON_KEY: "your-anon-public-key",
   ```
4. In Supabase **Authentication -> URL Configuration**, add your Vercel deployment URL (and `http://localhost:5500` for local testing) under **Redirect URLs**.
5. *(Optional)* Enable **Google** under **Authentication -> Providers** for one-click Google Sign-In.

## 3. Deploy to GitHub + Vercel
1. Commit and push the updated `viralreels-ai/` folder to GitHub.
2. Vercel will automatically redeploy your site with live `/login.html`, `/signup.html`, and `/dashboard.html` routes.
