-- GitHub release automation + Discord webhook (per user)
-- Run in Supabase SQL Editor after user_profiles.sql

alter table public.user_profiles
  add column if not exists github_access_token text,
  add column if not exists release_auto_repo text,
  add column if not exists discord_webhook_url text;

create index if not exists user_profiles_release_auto_repo_idx
  on public.user_profiles (release_auto_repo)
  where release_auto_repo is not null;
