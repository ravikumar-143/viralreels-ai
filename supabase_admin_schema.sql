-- ViralReels AI - Phase 8 Admin Role Migration
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Replace with your own admin email address:
-- update public.profiles set is_admin = true where email = 'you@example.com';
