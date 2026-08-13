# Ce qu'il me reste à faire — Easy Patch

> **Une seule checklist.** Supabase (tout SQL), Vercel core, Stripe Solo/Pro = **déjà fait — ne pas refaire.**  
> Repo : [GuillaumeWalter/BetterPatcher](https://github.com/GuillaumeWalter/BetterPatcher) · v0.7.0

**Vérifier ce qui manque :** dashboard → widget **Setup checklist** · ou `https://TON-DOMAINE/api/env-check`  
**Coller les clés :** [Vercel → Settings → Environment Variables](https://vercel.com/dashboard) → Production + Preview → **Redeploy**

---

## 1. Priorité — si je veux schedule Discord ou emails auto

### `CRON_SECRET` (je la génère moi-même, pas de site)

**PowerShell (Windows) :**

```powershell
-join ((1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) }))
```

**Git Bash / WSL :**

```bash
openssl rand -hex 32
```

→ Vercel : name `CRON_SECRET` · value = la chaîne générée (64 caractères hex)

**Sert à :** posts Discord planifiés (cron 5 min) · email « trial inactif » (cron quotidien)  
**Sans ça :** l'app tourne, mais schedule + ces crons ne marchent pas.

- [ ] `CRON_SECRET` généré et collé sur Vercel

### Resend — emails automatiques (bienvenue, trial, billing)

| Variable | Où |
|----------|-----|
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) → Create API Key → `re_…` |
| `RESEND_FROM_EMAIL` | [resend.com/domains](https://resend.com/domains) → après vérif domaine, ex. `Easy Patch <hello@tondomaine.com>` |

Compte : [resend.com/signup](https://resend.com/signup) · sans domaine vérifié = sandbox (emails seulement vers adresses test Resend)

Test : `https://TON-DOMAINE/api/emails/preview?template=welcome`

- [ ] Resend configuré sur Vercel

---

## 2. Stripe — une fois

- [ ] [Customer Portal](https://dashboard.stripe.com/settings/billing/portal) activé *(si « Manage subscription » plante)*
- [ ] Mode **Live** + prices live → **seulement quand j'encaisse pour de vrai**

### Toggle Annual dans l'UI (optionnel)

1. [Stripe → Products](https://dashboard.stripe.com/products) → Solo → Add price → Yearly → €50.88  
2. Pro → €101.88 / an  
3. Vercel : `STRIPE_SOLO_ANNUAL_PRICE_ID` et `STRIPE_PRO_ANNUAL_PRICE_ID` (`price_…`)

- [ ] Prices annuels *(optionnel)*

---

## 3. Test prod rapide (~10 min)

Remplace `TON-DOMAINE` par ton URL.

- [ ] Login GitHub → 1 génération → History
- [ ] Share Studio → copy draft
- [ ] Billing → portal ou checkout test
- [ ] Discord schedule *(si CRON_SECRET fait)*
- [ ] GitHub Action *(voir Settings dans l'app — doc `docs/github-action.md`)*

---

## 4. Beta (avant lancement public)

- [ ] 5 testeurs
- [ ] 2–3 citations / retours
- [ ] Corriger les bugs remontés

---

## 5. Lancement public FR (plus tard)

- [ ] Terms / Privacy personnalisés
- [ ] Domaine custom
- [ ] Stripe Live

---

## 6. Optionnel — seulement si j'active la feature

| Feature | Variables Vercel | Où les obtenir |
|---------|------------------|----------------|
| Monitoring erreurs | `SENTRY_DSN` | [sentry.io](https://sentry.io) → projet Next.js → DSN |
| Linear enrichissement | `AUTH_LINEAR_ID`, `AUTH_LINEAR_SECRET` | [linear.app/settings/api](https://linear.app/settings/api) → doc `docs/linear.md` |
| Discord bot `/easypatch link` | `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY` | [Discord Developer Portal](https://discord.com/developers/applications) → doc `docs/discord-bot.md` |
| Analytics | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | [plausible.io](https://plausible.io) |
| Webhook release signé | `GITHUB_WEBHOOK_SECRET` | même commande que `CRON_SECRET` → GitHub Webhooks → Secret |

*(Webhook Discord seul suffit pour publish immédiat — bot = optionnel.)*

---

## Si ça marche pas

| Symptôme | Fix |
|----------|-----|
| Schedule Discord ne part pas | `CRON_SECRET` sur Vercel + redeploy |
| Pas d'emails | Resend seulement |
| Billing portal KO | Customer Portal Stripe |
| Demo / regenerate abus | déjà géré (`rate_limits.sql` fait) |

---

## Liens utiles

| Quoi | Lien |
|------|------|
| Vercel | https://vercel.com/dashboard |
| Stripe Portal | https://dashboard.stripe.com/settings/billing/portal |
| GitHub Action | `docs/github-action.md` |
| Discord bot | `docs/discord-bot.md` |
| Emails | `docs/emails.md` |

*Dernière mise à jour : août 2026*
