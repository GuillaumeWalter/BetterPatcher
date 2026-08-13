-- Easy Patch — scheduled Discord posts (Share Studio P1)
-- Run in Supabase SQL Editor after patch_notes.sql

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  patch_note_id uuid references public.patch_notes(id) on delete cascade,
  platform text not null default 'discord'
    check (platform in ('discord')),
  content text not null,
  scheduled_at timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_posts_user_id_idx
  on public.scheduled_posts (user_id);

create index if not exists scheduled_posts_status_scheduled_idx
  on public.scheduled_posts (status, scheduled_at)
  where status = 'pending';

alter table public.scheduled_posts enable row level security;

create or replace function public.set_scheduled_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists scheduled_posts_updated_at on public.scheduled_posts;

create trigger scheduled_posts_updated_at
  before update on public.scheduled_posts
  for each row
  execute function public.set_scheduled_posts_updated_at();
