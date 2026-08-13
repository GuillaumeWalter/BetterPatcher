# Easy Patch — ta checklist (Guillaume)

> **Tu as déjà configuré Supabase + Vercel + Stripe.**  
> Ne refais **pas** toute la liste à chaque fois. Suis seulement **« Ce qui reste »** ci-dessous.

**Repo :** [GuillaumeWalter/BetterPatcher](https://github.com/GuillaumeWalter/BetterPatcher) · code **v0.7.0** sur `master`

---

## ✅ Déjà fait (ne plus me redemander)

Coche mentalement — **pas besoin de recommencer** :

| Zone | Statut |
|------|--------|
| Supabase SQL de base (profiles, patch_notes, drafts, plan_tiers, gitlab, integrations, go_live_gaps, discord_bot, linear_token) | ✅ Fait par toi |
| Vercel env vars core (`AUTH_*`, `SUPABASE_*`, `STRIPE_*`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_APP_URL`, GitLab) | ✅ En place (screenshot juillet) |
| GitHub OAuth callback | ✅ (si login marche, c’est bon) |
| Stripe Products Solo/Pro + webhook secret sur Vercel | ✅ En place |

**Première install complète (référence uniquement)** → [docs/setup-premiere-fois.md](./setup-premiere-fois.md)

---

## 🎯 Ce qui reste — à faire une seule fois

### 1. SQL **nouveau** depuis v0.6 / v0.7 (2 min)

**Uniquement si pas encore exécuté** — pas les 11 scripts, juste ceux-ci :

| Fichier | Pourquoi | Lien Raw |
|---------|----------|----------|
| `rate_limits.sql` | Anti-abus demo + regenerate | [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/rate_limits.sql) |
| `scheduled_posts.sql` | Discord schedule (v0.7) | [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/scheduled_posts.sql) |

→ [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new) · Run · si « already exists », c’est OK.

- [ ] `rate_limits.sql` exécuté
- [ ] `scheduled_posts.sql` exécuté

### 2. Vercel — **seulement ce qui manque peut‑être**

Tu as déjà le core. Vérifie **uniquement** ces vars **si** la feature t’intéresse :

| Variable | Obligatoire ? | Si absent, quoi ? |
|----------|---------------|-------------------|
| `CRON_SECRET` | Pour schedule Discord + email trial inactif | Schedule Discord ne part pas · cron trial KO |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Non (emails auto) | Pas d’emails bienvenue / billing |
| `STRIPE_SOLO_ANNUAL_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID` | Non | Toggle Annual dans billing sans checkout |
| `SENTRY_DSN` | Non | Pas de monitoring erreurs |
| `AUTH_LINEAR_ID` / `AUTH_LINEAR_SECRET` | Non | Linear connect KO |
| `DISCORD_BOT_*` (×3) | Non | Bot Discord KO (webhook fallback OK) |

- [ ] `CRON_SECRET` ajouté *(si tu veux schedule + cron emails)*
- [ ] Resend configuré *(si tu veux les emails)*

**Vérifier en prod (connecté)** : `https://TON-DOMAINE/api/env-check`  
Le widget **Setup checklist** sur le dashboard te dit ce qui manque encore — **sans refaire toute la config**.

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
