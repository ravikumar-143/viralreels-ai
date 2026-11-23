-- ViralReels AI - Phase 7 Payments Table
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  plan_name text not null,
  credits_added integer not null,
  amount_inr integer not null,
  status text default 'Paid',
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);
