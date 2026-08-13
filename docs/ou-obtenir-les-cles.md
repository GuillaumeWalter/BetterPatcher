# Où obtenir les clés optionnelles (Vercel)

> Tu as **déjà** Auth, Supabase, Stripe, Gemini sur Vercel.  
> Ci-dessous : uniquement les vars **supplémentaires** et **où les créer**.

**Où les coller :** [Vercel → ton projet → Settings → Environment Variables](https://vercel.com/dashboard)  
→ Production **et** Preview · puis **Redeploy**.

---

## 1. `CRON_SECRET` — tu la **génères toi-même**

Ce n’est **pas** un service externe. C’est une chaîne secrète que Vercel enverra dans les crons pour prouver que c’est bien ton app.

**Terminal (Mac/Linux) :**

```bash
openssl rand -hex 32
```

Copie le résultat (64 caractères hex) → Vercel :

| Name | Value |
|------|--------|
| `CRON_SECRET` | *(colle la chaîne générée)* |

**À quoi ça sert :**
- Rappel email « trial inactif » (cron quotidien)
- Envoi des **posts Discord planifiés** (cron toutes les 5 min)

**Sans ça :** l’app tourne, mais schedule Discord + cron emails ne marchent pas.

---

## 2. Resend — emails automatiques

| Variable | Où l’obtenir |
|----------|----------------|
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) → **Create API Key** → copier `re_…` |
| `RESEND_FROM_EMAIL` | Après [vérification domaine](https://resend.com/domains) : ex. `Easy Patch <hello@tondomaine.com>` |

**Compte :** [resend.com/signup](https://resend.com/signup) si pas encore inscrit.

**Sans domaine vérifié :** sandbox Resend = emails seulement vers adresses que tu as vérifiées dans Resend (OK pour tester).

**Test :** `https://TON-DOMAINE/api/emails/preview?template=welcome` (connecté ou en dev)

**Sans ça :** pas d’emails bienvenue, trial, billing — **le reste de l’app fonctionne**.

---

## 3. Stripe annuel (optionnel)

Déjà Solo/Pro mensuel ? Il te manque juste les **prices yearly** si tu veux le toggle Annual dans l’UI.

1. [Stripe → Products](https://dashboard.stripe.com/products) → ton produit Solo → **Add price** → **Yearly** → €50.88  
2. Idem Pro → €101.88 / an  
3. Copier les `price_…` → Vercel :

| Variable | Value |
|----------|--------|
| `STRIPE_SOLO_ANNUAL_PRICE_ID` | `price_…` |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | `price_…` |

---

## 4. Sentry — monitoring erreurs (optionnel)

1. [sentry.io](https://sentry.io) → Create project → **Next.js**  
2. **Client Keys (DSN)** → copier l’URL `https://…@….ingest.sentry.io/…`  
3. Vercel : `SENTRY_DSN` (et optionnel `NEXT_PUBLIC_SENTRY_DSN` même valeur)

---

## 5. Linear — enrichissement tickets (optionnel)

1. [linear.app/settings/api](https://linear.app/settings/api) → **OAuth applications** → New  
2. Redirect URI : `https://TON-DOMAINE/api/linear/callback`  
3. Vercel :

| Variable | Value |
|----------|--------|
| `AUTH_LINEAR_ID` | Client ID |
| `AUTH_LINEAR_SECRET` | Client secret |

Doc : [docs/linear.md](./linear.md)

---

## 6. Discord bot (optionnel — webhook suffit pour publish)

1. [Discord Developer Portal](https://discord.com/developers/applications) → ton app Easy Patch  
2. Vercel :

| Variable | Où dans Discord |
|----------|------------------|
| `DISCORD_BOT_TOKEN` | Bot → Reset Token |
| `DISCORD_APPLICATION_ID` | General Information → Application ID |
| `DISCORD_PUBLIC_KEY` | General Information → Public Key |

Doc : [docs/discord-bot.md](./discord-bot.md)

---

## 7. Plausible — analytics (optionnel)

1. [plausible.io](https://plausible.io) → Add site  
2. Vercel : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=tondomaine.com`

---

## 8. GitHub Release webhook secret (optionnel)

Si tu utilises le webhook release **avec** signature HMAC globale (pas seulement le token dans l’URL Settings) :

1. Invente une chaîne : `openssl rand -hex 32`  
2. Vercel : `GITHUB_WEBHOOK_SECRET`  
3. Même valeur dans GitHub repo → Webhooks → Secret

*(Sinon l’URL avec token dans Settings suffit.)*

---

## Vérifier ce qui manque encore

1. Connecte-toi sur ton app → **Dashboard** → widget **Setup checklist**  
2. Ou ouvre : `https://TON-DOMAINE/api/env-check` (JSON, connecté)

Les cases rouges = vars encore absentes sur Vercel.

---

## Récap « quoi faire en priorité »

| Priorité | Variable(s) | Où |
|----------|-------------|-----|
| **Si schedule Discord** | `CRON_SECRET` | `openssl rand -hex 32` → Vercel |
| **Si emails auto** | `RESEND_*` | [resend.com](https://resend.com) |
| **Si toggle Annual** | `STRIPE_*_ANNUAL_*` | Stripe Products |
| Reste | Sentry, Linear, Discord bot, Plausible | Optionnel |
