-- Easy Patch — platform drafts for Share Studio (P0)
-- Run in Supabase → SQL Editor on the Easy Patch project

create table if not exists public.platform_drafts (
  id uuid primary key default gen_random_uuid(),
  patch_note_id uuid not null references public.patch_notes (id) on delete cascade,
  platform text not null check (
    platform in (
      'discord',
      'x',
      'linkedin',
      'threads',
      'instagram',
      'facebook',
      'steam',
      'slack'
    )
  ),
  title text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patch_note_id, platform)
);

create index if not exists platform_drafts_patch_note_id_idx
  on public.platform_drafts (patch_note_id);

alter table public.platform_drafts enable row level security;

-- Access via service role only (Next.js API).

create or replace function public.set_platform_drafts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists platform_drafts_updated_at on public.platform_drafts;

create trigger platform_drafts_updated_at
  before update on public.platform_drafts
  for each row
  execute function public.set_platform_drafts_updated_at();
