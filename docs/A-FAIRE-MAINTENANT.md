# Easy Patch — tout ce que tu dois faire (checklist rapide)

> Tu n’as **rien fait depuis l’autre jour** ? Suis cette liste **dans l’ordre**.  
> Coche au fur et à mesure. Temps total réaliste : **~45–60 min** la première fois.

**Repo :** [GuillaumeWalter/BetterPatcher](https://github.com/GuillaumeWalter/BetterPatcher)

**État code (v0.6.0) :** le **cœur produit est terminé** côté agent (génération, Share Studio, onboarding guidé, team history, Linear, Discord). Il te reste surtout les **dashboards** (Supabase, Vercel, Stripe, Resend) + **beta testeurs** avant le marketing payant.

---

## 0. Code en prod (2 min)

Tout est sur **`master`** — Vercel redéploie à chaque push.

- [ ] Vérifier que **Vercel a redéployé** → [Dashboard Vercel](https://vercel.com/dashboard) → ton projet → **Deployments** → dernier deploy ✅

---

## 1. Supabase — SQL (10 min)

1. Ouvre ton projet → [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** → [New query](https://supabase.com/dashboard/project/_/sql/new)
2. Pour **chaque** fichier ci-dessous : ouvre le lien → **copie tout** → colle dans l’éditeur → **Run**  
   *(Si un script dit “already exists”, c’est OK — passe au suivant.)*

| # | Fichier | Lien (copier le SQL) |
|---|---------|----------------------|
| 1 | `user_profiles.sql` | [Ouvrir sur GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/user_profiles.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/user_profiles.sql) |
| 2 | `patch_notes.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/patch_notes.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/patch_notes.sql) |
| 3 | `platform_drafts.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/platform_drafts.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/platform_drafts.sql) |
| 4 | `plan_tiers.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/plan_tiers.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/plan_tiers.sql) |
| 5 | `gitlab_token.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/gitlab_token.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/gitlab_token.sql) |
| 6 | `integrations.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/integrations.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/integrations.sql) |
| 7 | `go_live_gaps.sql` ⭐ | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/go_live_gaps.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/go_live_gaps.sql) |
| 8 | `discord_bot.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/discord_bot.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/discord_bot.sql) |
| 9 | `linear_token.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/linear_token.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/linear_token.sql) |
| 10 | `rate_limits.sql` ⭐ | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/rate_limits.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/rate_limits.sql) |
| 11 | `scheduled_posts.sql` | [GitHub](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/scheduled_posts.sql) · [Raw](https://raw.githubusercontent.com/GuillaumeWalter/BetterPatcher/master/supabase/scheduled_posts.sql) |

> ⭐ `go_live_gaps.sql` = team seats, repos favoris, quota partagé Pro.  
> ⭐ `rate_limits.sql` = limites demo landing + régénération drafts (anti-abus Gemini).  
> `scheduled_posts.sql` = Discord schedule (cron toutes les 5 min).

3. Récupère tes clés Supabase → [Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)  
   - [ ] `SUPABASE_URL`  
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` *(service_role, pas anon)*

---

## 2. Vercel — variables d’environnement (15 min)

→ [Vercel Dashboard](https://vercel.com/dashboard) → ton projet **Easy Patch / BetterPatcher** → **Settings** → **Environment Variables**

### Obligatoire (sans ça l’app casse)

| Variable | Où la trouver |
|----------|----------------|
| `AUTH_SECRET` | Génère : `openssl rand -base64 32` dans ton terminal |
| `AUTH_GITHUB_ID` | [GitHub OAuth Apps](https://github.com/settings/developers) → ton app → Client ID |
| `AUTH_GITHUB_SECRET` | Même page → Client secret |
| `NEXT_PUBLIC_APP_URL` | Ton URL prod, ex. `https://ton-site.vercel.app` ou `https://easypatch.app` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `SUPABASE_URL` | Supabase → Settings → API (étape 1) |
| `SUPABASE_SERVICE_ROLE_KEY` | Idem |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Voir étape 3 Stripe ci-dessous |
| `STRIPE_SOLO_PRICE_ID` | Voir étape 3 Stripe |
| `STRIPE_PRO_PRICE_ID` | Voir étape 3 Stripe |

**Callback GitHub OAuth à configurer :**  
`https://TON-DOMAINE/api/auth/callback/github`  
→ [GitHub OAuth App settings](https://github.com/settings/developers)

### Emails + cron (fortement recommandé)

| Variable | Où |
|----------|-----|
| `RESEND_API_KEY` | [Resend → API Keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Ex. `Easy Patch <hello@tondomaine.com>` — domaine vérifié sur [Resend Domains](https://resend.com/domains) |
| `CRON_SECRET` | Chaîne aléatoire : `openssl rand -hex 32` *(requis pour schedule Discord + trial reminder)* |

### Optionnel (mais utile go-live)

| Variable | Lien |
|----------|------|
| `STRIPE_SOLO_ANNUAL_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe → Products (étape 3) |
| `SENTRY_DSN` | [sentry.io](https://sentry.io) → projet Next.js → Client Keys (DSN) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | [plausible.io](https://plausible.io) → ton domaine |
| `GITHUB_WEBHOOK_SECRET` | Si tu actives le webhook GitHub Release (étape 5) |
| `AUTH_LINEAR_ID` / `AUTH_LINEAR_SECRET` | [Linear OAuth](https://linear.app/settings/api) · [docs/linear.md](./linear.md) |
| `DISCORD_BOT_TOKEN` + `DISCORD_APPLICATION_ID` + `DISCORD_PUBLIC_KEY` | [docs/discord-bot.md](./discord-bot.md) |

**Liste complète :** [`.env.example`](../.env.example) · [docs/env-setup.md](./env-setup.md)

Après avoir ajouté des vars → **Redeploy** le dernier deployment sur Vercel.

---

## 3. Stripe (15 min)

### A. Customer Portal (obligatoire pour “Manage subscription”)

- [ ] [Stripe → Settings → Billing → Customer portal](https://dashboard.stripe.com/settings/billing/portal) → **Activer**

### B. Products & Prices

- [ ] [Stripe → Products](https://dashboard.stripe.com/products) → créer **Solo** et **Pro** si pas déjà fait  
- [ ] Prix **mensuels** : Solo **€4.99/mo**, Pro **€9.99/mo**  
- [ ] Copier les **Price ID** (`price_…`) → Vercel : `STRIPE_SOLO_PRICE_ID`, `STRIPE_PRO_PRICE_ID`

**Prix annuels (−15 %, optionnel mais déjà dans l’UI) :**

| Plan | Montant annuel suggéré |
|------|------------------------|
| Solo | €50.88 / an |
| Pro | €101.88 / an |

→ Créer 2 Prices **yearly** → Vercel : `STRIPE_SOLO_ANNUAL_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`

### C. Webhook

- [ ] [Stripe → Webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**  
- **URL :** `https://TON-DOMAINE/api/stripe/webhook`  
- **Events :** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`  
- [ ] Copier **Signing secret** → Vercel : `STRIPE_WEBHOOK_SECRET`

### D. Mode Live (quand tu es prêt à encaisser)

- [ ] [Stripe → toggle Test/Live](https://dashboard.stripe.com/test/dashboard) → passer en **Live**  
- [ ] Recréer les Prices + webhook en **Live** et mettre à jour les env vars Vercel

---

## 4. Resend — emails (5 min)

- [ ] Compte → [resend.com](https://resend.com/signup)  
- [ ] [API Key](https://resend.com/api-keys) → `RESEND_API_KEY` sur Vercel  
- [ ] [Vérifier un domaine](https://resend.com/domains) OU tester en sandbox (emails limités aux adresses vérifiées)  
- [ ] Preview d’un template (en local ou prod) :  
  `https://TON-DOMAINE/api/emails/preview?template=welcome`

---

## 5. Intégrations app (optionnel, 10 min)

Dans l’app une fois connecté :

| Action | Où dans l’app | Lien externe |
|--------|---------------|--------------|
| Release auto GitHub | [Dashboard → Settings](https://TON-DOMAINE/dashboard/settings) | [GitHub repo → Webhooks](https://github.com/settings/hooks) — event **Releases** |
| Discord publish | Settings ou bot `/easypatch link` | [docs/discord-bot.md](./discord-bot.md) |
| Linear tickets | Generator → Connect Linear | [docs/linear.md](./linear.md) |
| Team Pro (invites) | Settings → **Pro team seats** | — |
| Supprimer compte RGPD | Settings → **Delete account** | — |

Webhook URL release (affichée dans Settings) :  
`https://TON-DOMAINE/api/webhooks/github/release`

---

## 6. Test rapide prod (10 min)

Remplace `TON-DOMAINE` par ton URL Vercel.

- [ ] [Landing](https://TON-DOMAINE/) → **Try free** (demo sans compte) → **Load sample commits** si besoin  
- [ ] [Login GitHub](https://TON-DOMAINE/login) → onboarding carte €0  
- [ ] Après carte : **Continue to generator** → guide **Getting started** (4 étapes) visible  
- [ ] [Générer](https://TON-DOMAINE/dashboard/generate) une patch note → Share Studio → **Copy draft** (Discord ou Steam)  
- [ ] [History](https://TON-DOMAINE/dashboard/history) → note sauvegardée  
- [ ] [Billing](https://TON-DOMAINE/dashboard/billing) → toggle Monthly/Annual → test checkout *(mode Test Stripe)*  
- [ ] Email bienvenue reçu ?  
- [ ] [Vérifier config](https://TON-DOMAINE/api/env-check) *(connecté)* — tout doit être `true` pour les vars obligatoires  
- [ ] (Pro) Inviter un coéquipier → vérifier **historique partagé**  
- [ ] (Optionnel) [Linear](https://TON-DOMAINE/dashboard/generate) → Connect Linear → commits avec clés `ENG-42`  
- [ ] (Optionnel) Discord **Schedule** dans Share Studio → vérifier post après l’heure choisie  
- [ ] (Optionnel) [GitHub Action](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/docs/github-action.md) dans un repo test  
- [ ] [FAQ](https://TON-DOMAINE/faq) · [Contact](https://TON-DOMAINE/contact) · [Privacy](https://TON-DOMAINE/legal/privacy)

---

## 7. Beta structurée (avant pub / ads)

- [ ] Recruter **5 testeurs** (indie dev, live ops, ou marketer)  
- [ ] Leur envoyer : lien prod + cette checklist section 6  
- [ ] Leur demander de noter : onboarding carte, 1ère génération, Share Studio copy, billing  
- [ ] Collecter 2–3 citations courtes pour la landing  
- [ ] Remonter bugs / friction → issue GitHub ou message agent

---

## 8. Avant lancement public FR (quand tu veux)

- [ ] Personnaliser [Terms](https://TON-DOMAINE/legal/terms) et [Privacy](https://TON-DOMAINE/legal/privacy) (nom société, adresse)  
- [ ] Email `support@easypatch.app` → créer la boîte ou changer dans le code/footer  
- [ ] Stripe **Live** + domaine custom sur [Vercel Domains](https://vercel.com/dashboard/domains)  
- [ ] (Optionnel) [Sentry](https://sentry.io) pour les erreurs prod  
- [ ] (Optionnel) [Plausible](https://plausible.io) analytics

---

## Liens rapides — tout en un clic

| Service | Lien |
|---------|------|
| **GitHub repo** | https://github.com/GuillaumeWalter/BetterPatcher |
| **Vercel** | https://vercel.com/dashboard |
| **Supabase** | https://supabase.com/dashboard |
| **Supabase SQL** | https://supabase.com/dashboard/project/_/sql/new |
| **Stripe** | https://dashboard.stripe.com |
| **Stripe Portal** | https://dashboard.stripe.com/settings/billing/portal |
| **Stripe Webhooks** | https://dashboard.stripe.com/webhooks |
| **Stripe Products** | https://dashboard.stripe.com/products |
| **Resend** | https://resend.com/overview |
| **GitHub OAuth** | https://github.com/settings/developers |
| **Google AI key** | https://aistudio.google.com/apikey |
| **Sentry** | https://sentry.io |
| **Plausible** | https://plausible.io |

---

## Si ça marche pas

| Symptôme | Fix |
|----------|-----|
| Rien ne change en prod | Merge `master` + redeploy Vercel |
| Login GitHub échoue | Callback URL OAuth = `https://TON-DOMAINE/api/auth/callback/github` |
| Billing / portal erreur | Activer [Customer Portal](https://dashboard.stripe.com/settings/billing/portal) |
| Pas d’emails | `RESEND_API_KEY` + domaine vérifié Resend |
| Génération IA fail | `GOOGLE_GENERATIVE_AI_API_KEY` sur Vercel |
| Team seats / favoris KO | Exécuter `go_live_gaps.sql` sur Supabase |
| Cron trial inactif | `CRON_SECRET` sur Vercel (plan Pro Vercel pour crons) |
| Demo / regenerate abus | Exécuter `rate_limits.sql` sur Supabase |

---

## Docs détaillées (si besoin)

- [docs/env-setup.md](./env-setup.md) — toutes les env vars  
- [docs/emails.md](./emails.md) — liste des emails auto  
- [docs/VOTRE-TODO.md](./VOTRE-TODO.md) — version courte précédente  
- [docs/SCORE-10-10.md](./SCORE-10-10.md) — audit go-live (cœur produit 10/10)

---

*Dernière mise à jour : août 2026 — v0.7.0 (Discord schedule, GitHub Action).*
