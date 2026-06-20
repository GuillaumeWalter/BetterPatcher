-- Release Hub — historique des patch notes (Phase 2.2a)
-- Exécuter dans Supabase → SQL Editor

create table if not exists public.patch_notes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_email text,
  tone text not null check (tone in ('technical', 'marketing', 'gaming')),
  repo_full_name text,
  commits_raw text not null,
  markdown text not null,
  social_post text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patch_notes_user_id_created_at_idx
  on public.patch_notes (user_id, created_at desc);

alter table public.patch_notes enable row level security;

-- Accès via service role uniquement (API Next.js).

create or replace function public.set_patch_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists patch_notes_updated_at on public.patch_notes;

create trigger patch_notes_updated_at
  before update on public.patch_notes
  for each row
  execute function public.set_patch_notes_updated_at();
