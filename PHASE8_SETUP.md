# ViralReels AI — Phase 8 Setup (Admin Dashboard)

## 1. Run Admin Migration in Supabase
Run `supabase_admin_schema.sql` in **Supabase -> SQL Editor -> New Query**.

## 2. Add Server-Side Admin Variables in Vercel
In **Vercel -> Project Settings -> Environment Variables**, add:
- `SUPABASE_URL` (your Supabase project URL)
- `SUPABASE_SERVICE_ROLE_KEY` (keep strictly server-side; never expose in frontend JS)
- `ADMIN_EMAILS` (comma-separated list of owner/admin emails allowed to access `/admin.html`)

## 3. Deploy & Access Admin Console
Copy `admin.html`, `js/admin.js`, `api/admin-data.js`, `api/admin-update-user.js`, `supabase_admin_schema.sql`, and `.env.example` into your `viralreels-ai/` repository and push to GitHub. Visit `https://your-app.vercel.app/admin.html` after signing in with an admin email.
