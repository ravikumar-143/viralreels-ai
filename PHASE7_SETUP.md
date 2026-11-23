# ViralReels AI — Phase 7 Setup (Payments & Subscriptions)

## 1. Run the Payments Table Schema in Supabase
Run `supabase_payments_schema.sql` in **Supabase -> SQL Editor -> New Query**.

## 2. Add Razorpay Keys in Vercel
In **Vercel -> Project Settings -> Environment Variables**, add:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## 3. Deploy Files
Copy `api/create-order.js`, `api/verify-payment.js`, `js/billing.js`, `supabase_payments_schema.sql`, `.env.example`, and the updated `dashboard.html` + `js/dashboard.js` into your `viralreels-ai/` repository and push to GitHub.
