-- Easy Patch — Linear OAuth token (Phase 2 ticket enrichment)
-- Run in Supabase SQL Editor after go_live_gaps.sql

alter table public.user_profiles
  add column if not exists linear_access_token text;
