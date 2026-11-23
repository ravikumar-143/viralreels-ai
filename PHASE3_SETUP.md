# ViralReels AI — Phase 3 Setup (User Dashboard & Supabase Database)

## 1. Run the Database Schema in Supabase
1. Open your Supabase project -> **SQL Editor** -> **New Query**.
2. Paste the contents of `supabase_schema.sql` and click **Run**.
3. This creates `profiles`, `videos`, `social_accounts`, and `scheduled_posts` tables with Row Level Security (RLS) and auto-assigns 10 starter credits to new signups.

## 2. Update Your Project Files
Replace `dashboard.html`, `css/dashboard.css`, and `js/dashboard.js` in your `viralreels-ai/` folder with the Phase 3 versions from this archive (keep your `js/config.js` keys intact).

## 3. What's Live in Phase 3
- **Overview**: Real-time KPIs (videos, credits, channels, scheduled posts) and recent projects table.
- **My Videos**: Searchable & filterable library with project creation and deletion synced to Supabase (or local browser storage in Demo Mode).
- **Scheduled Posts**: Add and remove queued YouTube Shorts & Instagram Reels posts.
- **Analytics**: 7-day views bar chart and Ready vs. Draft breakdown.
- **Settings**: Profile name sync to both `auth.users` and `public.profiles`, plus password updates.
