# Easy Patch — setup première fois (from scratch)

> **Guillaume : tu n’as pas besoin de ce fichier** — ta base est déjà faite.  
> Référence pour un nouveau projet, un co-dev, ou une réinstall Supabase vierge.

---

## 1. Supabase — tous les SQL (ordre)

Exécuter dans [SQL Editor](https://supabase.com/dashboard/project/_/sql/new).  
Si « already exists », passer au suivant.

| # | Fichier |
|---|---------|
| 1 | `user_profiles.sql` |
| 2 | `patch_notes.sql` |
| 3 | `platform_drafts.sql` |
| 4 | `plan_tiers.sql` |
| 5 | `gitlab_token.sql` |
| 6 | `integrations.sql` |
| 7 | `go_live_gaps.sql` |
| 8 | `discord_bot.sql` |
| 9 | `linear_token.sql` |
| 10 | `rate_limits.sql` |
| 11 | `scheduled_posts.sql` |

Liens Raw : remplacer `FILENAME` dans  
`https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/FILENAME`

---

## 2. Vercel — env vars obligatoires

| Variable |
|----------|
| `AUTH_SECRET` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` |
| `NEXT_PUBLIC_APP_URL` |
| `GOOGLE_GENERATIVE_AI_API_KEY` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` |
| `STRIPE_SOLO_PRICE_ID` / `STRIPE_PRO_PRICE_ID` |

Recommandé : `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

Optionnel : GitLab, Linear, Discord bot, Sentry, Plausible, Stripe annual

Voir [`.env.example`](../.env.example) et [docs/env-setup.md](./env-setup.md)

---

## 3. Stripe

1. Customer Portal activé  
2. Products Solo / Pro + webhook → `/api/stripe/webhook`  
3. Live quand prêt à encaisser

---

## 4. Test

Checklist owner : [TODO-GUILLAUME.md](../TODO-GUILLAUME.md) section 3
