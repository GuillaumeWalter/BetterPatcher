-- Easy Patch — plan_tier Solo / Pro + quotas mis à jour
-- Exécuter dans Supabase → SQL Editor (projets déjà provisionnés)

alter table public.user_profiles
  add column if not exists plan_tier text not null default 'none'
  check (plan_tier in ('none', 'solo', 'pro'));

-- Abonnés déjà actifs (ancien Pro unique) → tier pro + quota 80
update public.user_profiles
set
  plan_tier = 'pro',
  period_generations_limit = case
    when period_generations_limit = 60 or period_generations_limit <= 0 then 80
    else period_generations_limit
  end
where subscription_status = 'active'
  and plan_tier = 'none';

-- Consommation atomique d'une génération (évite les race conditions)
create or replace function public.consume_generation(p_user_id text, p_min_interval_seconds integer default 20)
returns jsonb
language plpgsql
as $$
declare
  profile public.user_profiles%rowtype;
  remaining integer;
  active_plan text;
  default_limit integer;
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
      where user_id = p_user_id
      returning * into profile;
    end if;

    if profile.period_generations_used >= profile.period_generations_limit then
      return jsonb_build_object('ok', false, 'code', 'quota_exceeded', 'plan', active_plan);
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
  if p_plan in ('pro', 'solo') then
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
