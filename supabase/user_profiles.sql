-- Release Hub — profils utilisateurs, quotas IA, Stripe
-- Exécuter dans Supabase → SQL Editor

create table if not exists public.user_profiles (
  user_id text primary key,
  email text,
  stripe_customer_id text unique,
  payment_method_verified boolean not null default false,
  subscription_status text not null default 'none'
    check (subscription_status in ('none', 'active', 'past_due', 'canceled')),
  stripe_subscription_id text,
  trial_generations_used integer not null default 0,
  trial_generations_limit integer not null default 5,
  period_generations_used integer not null default 0,
  period_generations_limit integer not null default 0,
  billing_period_start timestamptz,
  last_generation_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_stripe_customer_id_idx
  on public.user_profiles (stripe_customer_id);

alter table public.user_profiles enable row level security;

create or replace function public.set_user_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on public.user_profiles;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.set_user_profiles_updated_at();

-- Consommation atomique d'une génération (évite les race conditions)
create or replace function public.consume_generation(p_user_id text, p_min_interval_seconds integer default 20)
returns jsonb
language plpgsql
as $$
declare
  profile public.user_profiles%rowtype;
  remaining integer;
begin
  select * into profile
  from public.user_profiles
  where user_id = p_user_id
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
    if profile.period_generations_limit <= 0 then
      update public.user_profiles
      set period_generations_limit = 60
      where user_id = p_user_id
      returning * into profile;
    end if;

    if profile.period_generations_used >= profile.period_generations_limit then
      return jsonb_build_object('ok', false, 'code', 'quota_exceeded', 'plan', 'pro');
    end if;

    update public.user_profiles
    set
      period_generations_used = period_generations_used + 1,
      last_generation_at = now()
    where user_id = p_user_id
    returning * into profile;

    remaining := greatest(0, profile.period_generations_limit - profile.period_generations_used);

    return jsonb_build_object(
      'ok', true,
      'plan', 'pro',
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
  where user_id = p_user_id
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

create or replace function public.refund_generation(p_user_id text, p_plan text)
returns void
language plpgsql
as $$
begin
  if p_plan = 'pro' then
    update public.user_profiles
    set period_generations_used = greatest(0, period_generations_used - 1)
    where user_id = p_user_id;
  else
    update public.user_profiles
    set trial_generations_used = greatest(0, trial_generations_used - 1)
    where user_id = p_user_id;
  end if;
end;
$$;
