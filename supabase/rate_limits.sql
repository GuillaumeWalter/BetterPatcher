-- Easy Patch — durable rate limits (demo IP, draft regeneration, etc.)
-- Run in Supabase SQL Editor after user_profiles.sql

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists rate_limits_reset_at_idx
  on public.rate_limits (reset_at);

alter table public.rate_limits enable row level security;

-- Peek without consuming a slot
create or replace function public.peek_rate_limit(p_key text, p_limit integer)
returns jsonb
language plpgsql
as $$
declare
  row public.rate_limits%rowtype;
begin
  select * into row from public.rate_limits where key = p_key;

  if not found or row.reset_at <= now() then
    return jsonb_build_object('remaining', p_limit, 'limit', p_limit);
  end if;

  return jsonb_build_object(
    'remaining', greatest(0, p_limit - row.count),
    'limit', p_limit
  );
end;
$$;

-- Atomic check + increment (supports batch consume for regenerate_all)
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer,
  p_increment integer default 1
)
returns jsonb
language plpgsql
as $$
declare
  row public.rate_limits%rowtype;
  next_reset timestamptz;
  inc integer := greatest(1, coalesce(p_increment, 1));
begin
  if p_limit <= 0 then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'limit', p_limit);
  end if;

  select * into row from public.rate_limits where key = p_key for update;

  if not found or row.reset_at <= now() then
    next_reset := now() + (p_window_seconds || ' seconds')::interval;

    if inc > p_limit then
      insert into public.rate_limits (key, count, reset_at)
      values (p_key, 0, next_reset)
      on conflict (key) do update
        set count = 0, reset_at = excluded.reset_at;

      return jsonb_build_object(
        'allowed', false,
        'remaining', 0,
        'limit', p_limit,
        'retry_after_seconds', p_window_seconds
      );
    end if;

    insert into public.rate_limits (key, count, reset_at)
    values (p_key, inc, next_reset)
    on conflict (key) do update
      set count = inc, reset_at = excluded.reset_at
    returning * into row;

    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(0, p_limit - row.count),
      'limit', p_limit
    );
  end if;

  if row.count + inc > p_limit then
    return jsonb_build_object(
      'allowed', false,
      'remaining', greatest(0, p_limit - row.count),
      'limit', p_limit,
      'retry_after_seconds', greatest(
        1,
        ceil(extract(epoch from (row.reset_at - now())))::integer
      )
    );
  end if;

  update public.rate_limits
  set count = count + inc
  where key = p_key
  returning * into row;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(0, p_limit - row.count),
    'limit', p_limit
  );
end;
$$;
