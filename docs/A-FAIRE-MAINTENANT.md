# Easy Patch — ta checklist (Guillaume)

> **Tu as déjà configuré Supabase + Vercel + Stripe.**  
> Ne refais **pas** toute la liste à chaque fois. Suis seulement **« Ce qui reste »** ci-dessous.

**Repo :** [GuillaumeWalter/BetterPatcher](https://github.com/GuillaumeWalter/BetterPatcher) · code **v0.7.0** sur `master`

---

## ✅ Déjà fait (ne plus me redemander)

Coche mentalement — **pas besoin de recommencer** :

| Zone | Statut |
|------|--------|
| Supabase SQL de base + `rate_limits.sql` + `scheduled_posts.sql` | ✅ Fait |
| Vercel env vars core (`AUTH_*`, `SUPABASE_*`, `STRIPE_*`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_APP_URL`, GitLab) | ✅ En place (screenshot juillet) |
| GitHub OAuth callback | ✅ (si login marche, c’est bon) |
| Stripe Products Solo/Pro + webhook secret sur Vercel | ✅ En place |

**Première install complète (référence uniquement)** → [docs/setup-premiere-fois.md](./setup-premiere-fois.md)

---

## 🎯 Ce qui reste

### 1. ~~SQL nouveau~~ — ✅ déjà fait

`rate_limits.sql` et `scheduled_posts.sql` : **OK, ne plus toucher.**

### 2. Vercel — vars **optionnelles** (où les obtenir)

Guide détaillé : **[docs/ou-obtenir-les-cles.md](./ou-obtenir-les-cles.md)** ← liens directs + commandes

| Variable | Tu la crées où ? | En 1 ligne |
|----------|------------------|------------|
| **`CRON_SECRET`** | **Toi** — terminal : `openssl rand -hex 32` | Pas de site · colle sur Vercel |
| **`RESEND_API_KEY`** | [resend.com/api-keys](https://resend.com/api-keys) | Create API Key → `re_…` |
| **`RESEND_FROM_EMAIL`** | [resend.com/domains](https://resend.com/domains) | Après vérif domaine, ex. `Easy Patch <hello@…>` |
| **`STRIPE_*_ANNUAL_*`** | [Stripe Products](https://dashboard.stripe.com/products) | Prices yearly → `price_…` |
| **`SENTRY_DSN`** | [sentry.io](https://sentry.io) → projet Next.js → DSN | |
| **`AUTH_LINEAR_*`** | [linear.app/settings/api](https://linear.app/settings/api) | OAuth app |
| **`DISCORD_BOT_*`** | [Discord Developer Portal](https://discord.com/developers/applications) | Bot token + App ID + Public Key |

**Coller sur Vercel :** [Settings → Environment Variables](https://vercel.com/dashboard) → Production + Preview → **Redeploy**.

- [ ] `CRON_SECRET` *(si schedule Discord ou cron emails)*
- [ ] Resend *(si emails auto)*

**Vérifier ce qui manque :** dashboard → widget **Setup checklist** ou `https://TON-DOMAINE/api/env-check`

### 3. Stripe — une fois

- [ ] [Customer Portal](https://dashboard.stripe.com/settings/billing/portal) activé *(si « Manage subscription » plante)*
- [ ] Mode **Live** + prices live → **seulement quand tu encaisses pour de vrai**

### 4. Test prod rapide (10 min)

Remplace `TON-DOMAINE` par ton URL.

- [ ] Login GitHub → 1 génération → History
- [ ] Share Studio → copy draft
- [ ] Billing → portal ou checkout test
- [ ] *(Optionnel)* Discord schedule · GitHub Action · Linear

### 5. Beta (quand tu veux lancer)

- [ ] 5 testeurs · 2–3 citations · feedback bugs

### 6. Lancement public FR (plus tard)

- [ ] Terms / Privacy personnalisés · domaine custom · Stripe Live

---

## Liens rapides

| Quoi | Lien |
|------|------|
| Vercel deploy | https://vercel.com/dashboard |
| Supabase SQL | https://supabase.com/dashboard/project/_/sql/new |
| Stripe Portal | https://dashboard.stripe.com/settings/billing/portal |
| GitHub Action doc | [docs/github-action.md](./github-action.md) |
| Discord bot doc | [docs/discord-bot.md](./discord-bot.md) |

---

## Si ça marche pas

| Symptôme | Fix ciblé (pas tout refaire) |
|----------|------------------------------|
| Schedule Discord ne part pas | `CRON_SECRET` + `scheduled_posts.sql` + plan Vercel cron |
| Demo / regenerate abus | `rate_limits.sql` |
| Team seats / favoris KO | `go_live_gaps.sql` *(déjà fait chez toi normalement)* |
| Pas d’emails | Resend seulement |
| Billing portal | Customer Portal Stripe |

---

## Autres docs

- [docs/VOTRE-TODO.md](./VOTRE-TODO.md) — résumé 1 page  
- [docs/setup-premiere-fois.md](./setup-premiere-fois.md) — install from scratch (autre projet / autre dev)  
- [docs/SCORE-10-10.md](./SCORE-10-10.md) — audit go-live

---

*Dernière mise à jour : août 2026 — adapté setup Guillaume (base déjà faite, delta v0.7 seulement).*
