# Release Hub

SaaS qui transforme des messages de commit en patch notes Markdown et posts réseaux, via IA (Gemini).

**Stack :** Next.js 16 · NextAuth (GitHub) · Supabase · Stripe · Vercel AI SDK

**Documentation projet :** [docs/GO-LIVE.md](docs/GO-LIVE.md) — analyse go-live, checklist, gaps par domaine.

## Développement local

```bash
cp .env.example .env.local
# Remplir les variables (voir ci-dessous)
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Pour les webhooks Stripe en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`

Diagnostic env : [http://localhost:3000/api/env-check](http://localhost:3000/api/env-check)

## Mise en production (checklist)

1. **Vercel** — importer le repo, build `npm run build`
2. **Supabase** — créer un projet, exécuter dans l’ordre :
   - `supabase/user_profiles.sql`
   - `supabase/patch_notes.sql`
   - `supabase/waitlist.sql` (optionnel)
3. **GitHub OAuth** — callback : `https://<domaine>/api/auth/callback/github`
4. **Google AI Studio** — clé `GOOGLE_GENERATIVE_AI_API_KEY` (ou AI Gateway)
5. **Stripe** — produit récurrent, webhook, **activer le Customer Portal** dans le dashboard Stripe
6. **Variables d’environnement** sur Vercel (voir `.env.example`)
7. **Personnaliser** `/legal/cgu` et `/legal/confidentialite`
8. **Vérifier** : `https://<domaine>/api/env-check?secret=<ENV_CHECK_SECRET>`

Voir [docs/GO-LIVE.md](docs/GO-LIVE.md) pour la checklist complète P0/P1/P2.

## Variables d’environnement

Voir [`.env.example`](.env.example) pour la liste complète.

| Variable | Obligatoire |
|----------|-------------|
| `AUTH_SECRET` | Oui |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Oui |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Oui |
| `GOOGLE_GENERATIVE_AI_API_KEY` ou `AI_GATEWAY_API_KEY` | Oui |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRO_PRICE_ID` | Oui |
| `NEXT_PUBLIC_APP_URL` | Oui (sauf auto sur Vercel) |
| `ENV_CHECK_SECRET` | Recommandé en prod |

## Scripts

```bash
npm run dev      # serveur de dev
npm run build    # build production
npm run start    # serveur production
npm run lint     # ESLint
```
