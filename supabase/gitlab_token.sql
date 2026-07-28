-- Easy Patch | GitLab OAuth token on user profiles
-- Run in Supabase → SQL Editor

alter table public.user_profiles
  add column if not exists gitlab_access_token text;
