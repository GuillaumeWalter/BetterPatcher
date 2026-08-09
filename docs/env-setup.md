# Easy Patch | Environment setup checklist

Run this when you have time on Vercel / Stripe / Supabase. The app code already expects these names.

## 1. Supabase SQL (run in SQL Editor)

In order:

1. `supabase/user_profiles.sql`
2. `supabase/patch_notes.sql`
3. `supabase/plan_tiers.sql`
4. `supabase/gitlab_token.sql`
5. `supabase/tone_options.sql` (adds Steam / Discord / Minimal tones)
6. `supabase/waitlist.sql` (only if you re-enable the waitlist UI)

## 2. Vercel environment variables

### Auth (required)

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | Random secret for Auth.js (also accepts `NEXTAUTH_SECRET`) |
| `AUTH_GITHUB_ID` | GitHub OAuth App client id |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (e.g. `https://easypatch.app`) |

GitHub OAuth callback: `https://YOUR_DOMAIN/api/auth/callback/github`

### GitLab import (optional, Trial + Solo + Pro)

| Variable | Notes |
|----------|--------|
| `AUTH_GITLAB_ID` | GitLab OAuth Application id |
| `AUTH_GITLAB_SECRET` | GitLab OAuth secret |
| `GITLAB_BASE_URL` | Optional; default `https://gitlab.com` (self-hosted OK) |

Redirect URI: `https://YOUR_DOMAIN/api/gitlab/callback`  
Scopes: `read_user`, `read_api`

### AI (at least one)

| Variable | Notes |
|----------|--------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Preferred (Gemini free tier) |
| `AI_GATEWAY_API_KEY` | Fallback via Vercel AI Gateway |

### Stripe (required for trial card + subscriptions)

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY` | Secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_SOLO_PRICE_ID` | EUR Solo monthly Price (default / fallback) |
| `STRIPE_PRO_PRICE_ID` | EUR Pro monthly Price |

Optional localized Prices (same amount intent; geo from `x-vercel-ip-country`):

| Currency | Solo | Pro |
|----------|------|-----|
| USD | `STRIPE_SOLO_PRICE_ID_USD` | `STRIPE_PRO_PRICE_ID_USD` |
| GBP | `STRIPE_SOLO_PRICE_ID_GBP` | `STRIPE_PRO_PRICE_ID_GBP` |
| JPY | `STRIPE_SOLO_PRICE_ID_JPY` | `STRIPE_PRO_PRICE_ID_JPY` |
| KRW | `STRIPE_SOLO_PRICE_ID_KRW` | `STRIPE_PRO_PRICE_ID_KRW` |

Amounts: see `docs/product-roadmap.md`. Missing local Price falls back to EUR.

Webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`

### Supabase (required for accounts / history / quotas)

| Variable | Notes |
|----------|--------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only; never expose to the client) |

## 3. Quick presence check

Signed-in users can hit `GET /api/env-check` to see which variables are **present** (boolean only, never values).

## 4. Still open product decisions

See `docs/open-questions.md` (Jira / Linear Phase 2, waitlist, seats).
