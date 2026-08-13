-- Easy Patch — go-live gaps: team seats, favorite repos, shared quota
-- Run in Supabase → SQL Editor after integrations.sql

alter table public.user_profiles
  add column if not exists workspace_owner_id text references public.user_profiles (user_id) on delete set null,
  add column if not exists favorite_repos text[] not null default '{}';

create index if not exists user_profiles_workspace_owner_id_idx
  on public.user_profiles (workspace_owner_id);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null references public.user_profiles (user_id) on delete cascade,
  invitee_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  unique (owner_user_id, invitee_email)
);

create index if not exists team_invites_email_status_idx
  on public.team_invites (invitee_email, status);

alter table public.team_invites enable row level security;

-- Resolve billing user (team members consume owner's quota)
create or replace function public.resolve_billing_user_id(p_user_id text)
returns text
language sql
stable
as $$
  select coalesce(
    (select workspace_owner_id from public.user_profiles where user_id = p_user_id),
    p_user_id
  );
$$;

create or replace function public.consume_generation(p_user_id text, p_min_interval_seconds integer default 20)
returns jsonb
language plpgsql
as $$
declare
  billing_user_id text;
  profile public.user_profiles%rowtype;
  remaining integer;
  active_plan text;
  default_limit integer;
begin
  billing_user_id := public.resolve_billing_user_id(p_user_id);

  select * into profile
  from public.user_profiles
  where user_id = billing_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'profile_not_found');
  end if;

  if not profile.payment_method_verified then
    return jsonb_build_object('ok', false, 'code', 'setup_required');
  end if;

  if profile.last_generation_at is not null
     and profile.last_generation_at > now() - (p_min_interval_seconds || ' seconds')::interval then
    return jsonb_build_object('ok', false, 'code', 'rate_limited');
  end if;

  if profile.subscription_status = 'active' then
    active_plan := case
      when profile.plan_tier = 'solo' then 'solo'
      else 'pro'
    end;

    default_limit := case
      when active_plan = 'solo' then 25
      else 80
    end;

    if profile.period_generations_limit <= 0 then
      update public.user_profiles
      set period_generations_limit = default_limit
      where user_id = billing_user_id
      returning * into profile;
    end if;

    if profile.period_generations_used >= profile.period_generations_limit then
      return jsonb_build_object('ok', false, 'code', 'quota_exceeded', 'plan', active_plan);
    end if;

    update public.user_profiles
    set
      period_generations_used = period_generations_used + 1,
      last_generation_at = now()
    where user_id = billing_user_id
    returning * into profile;

    remaining := greatest(0, profile.period_generations_limit - profile.period_generations_used);

    return jsonb_build_object(
      'ok', true,
      'plan', active_plan,
      'generations_used', profile.period_generations_used,
      'generations_limit', profile.period_generations_limit,
      'generations_remaining', remaining
    );
  end if;

  if profile.trial_generations_used >= profile.trial_generations_limit then
    return jsonb_build_object('ok', false, 'code', 'subscription_required', 'plan', 'trial');
  end if;

  update public.user_profiles
  set
    trial_generations_used = trial_generations_used + 1,
    last_generation_at = now()
  where user_id = billing_user_id
  returning * into profile;

  remaining := greatest(0, profile.trial_generations_limit - profile.trial_generations_used);

  return jsonb_build_object(
    'ok', true,
    'plan', 'trial',
    'generations_used', profile.trial_generations_used,
    'generations_limit', profile.trial_generations_limit,
    'generations_remaining', remaining
  );
end;
$$;
