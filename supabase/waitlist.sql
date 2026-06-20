-- Release Hub — liste d'attente (Phase 1.4)
-- Exécuter dans Supabase → SQL Editor sur un NOUVEAU projet dédié

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_unique unique (email),
  constraint waitlist_signups_email_format check (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Pas de policy publique : les inserts passent par l'API Next.js (service role).
