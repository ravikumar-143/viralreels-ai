-- ViralReels AI - Phase 3 Supabase Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  plan text default 'Starter',
  credits integer default 10,
  email_notifications boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup with 10 starter credits
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    10
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Videos table
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  niche text not null,
  aspect_ratio text default '9:16',
  duration_sec integer default 45,
  status text default 'Draft', -- Draft | Rendering | Ready
  video_url text,
  views integer default 0,
  created_at timestamptz default now()
);

alter table public.videos enable row level security;

create policy "Users can manage own videos"
  on public.videos for all
  using (auth.uid() = user_id);

-- 3. Connected Social Accounts
create table if not exists public.social_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  platform text not null, -- youtube | instagram
  account_name text not null,
  followers_count integer default 0,
  connected_at timestamptz default now()
);

alter table public.social_accounts enable row level security;

create policy "Users can manage own social accounts"
  on public.social_accounts for all
  using (auth.uid() = user_id);

-- 4. Scheduled Posts
create table if not exists public.scheduled_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_id uuid references public.videos on delete cascade,
  video_title text not null,
  platform text not null, -- YouTube Shorts | Instagram Reels
  scheduled_for timestamptz not null,
  status text default 'Scheduled', -- Scheduled | Published | Cancelled
  created_at timestamptz default now()
);

alter table public.scheduled_posts enable row level security;

create policy "Users can manage own scheduled posts"
  on public.scheduled_posts for all
  using (auth.uid() = user_id);
