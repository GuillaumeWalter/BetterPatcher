-- Easy Patch — Discord bot channel linking
-- Run in Supabase SQL Editor after go_live_gaps.sql

alter table public.user_profiles
  add column if not exists discord_guild_id text,
  add column if not exists discord_channel_id text,
  add column if not exists discord_link_code text,
  add column if not exists discord_link_code_expires_at timestamptz;

create index if not exists user_profiles_discord_link_code_idx
  on public.user_profiles (discord_link_code)
  where discord_link_code is not null;
