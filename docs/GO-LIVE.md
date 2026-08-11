# Release Hub — Analyse go-live

> Dernière mise à jour : août 2026  
> Branche de référence : `cursor/quick-polish-8b37` (PR #1)

Document de référence : état du produit, gaps par domaine, checklist priorisée.  
**Ne pas supprimer** — sert de mémoire projet entre sessions.

---

## 1. Résumé exécutif

**Release Hub** est un SaaS B2B qui transforme des commits en patch notes Markdown + posts réseaux via IA (Gemini).

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Fonctionnel | ~80 % | Cœur produit opérationnel |
| UX/UI | ~70 % | Beta privée OK, public = polish restant |
| Marketing | ~60 % | Bon pitch, peu de leviers conversion |
| Communication | ~40 % | Légal + contact en cours |
| Dev/Ops | ~40 % | Deploy + secrets à faire |
| Webdesign | ~75 % | Belle base, finitions manquantes |
| Gestion de projet | ~50 % | Doc OK, DoD go-live à valider |
| Argent | ~50 % | Modèle clair, Stripe pas live |

**Recommandation :** beta privée possible après config infra (1 session). Lancement public après P0 validé.

---

## 2. Ce qui a été fait (historique récent)

### Fondations
- Next.js 16 App Router, TypeScript, Tailwind 4, shadcn/ui
- Thème warm/gradient cohérent
- Générateur IA : 3 tonalités, options emojis/hashtags/highlights

### Auth & données
- NextAuth v5 + GitHub OAuth (scope `repo`)
- Dashboard : générer, historique, billing
- Supabase : profils, quotas RPC, historique patch notes, waitlist
- Import GitHub : repos + 30 derniers commits

### Monétisation
- Stripe setup 0 € (anti-abus) + abonnement Pro (~10 €/mois)
- Quotas : 5 essai / 60 Pro par mois
- Webhooks : checkout, subscription, invoice
- Bannière quota dynamique

### Polish (PR #1 + P0)
- Landing : tarifs, waitlist webhooks, SEO/OG
- `.env.example`, README, ce document
- Pages légales, footer, 404, favicon
- Stripe Customer Portal, billing par plan
- Gate onboarding dashboard, fixes liens morts

---

## 3. Parcours utilisateur actuel

```
Landing (/)
  → GitHub OAuth (/login)
  → Onboarding carte 0 € (/onboarding)
  → Générateur (/dashboard/generate)
  → Historique (/dashboard/history)
  → Billing (/dashboard/billing) si essai épuisé ou gestion abo
```

---

## 4. Analyse par domaine

### 4.1 UX / UI

**Points forts**
- Parcours principal clair, copy FR cohérente
- États loading/erreur sur générateur, waitlist, billing
- Dashboard responsive

**Gaps restants (P1+)**
- Badge header statique (ne reflète pas le plan Pro)
- Waitlist « bientôt » vs CTA « Commencer » (message mixte)
- Copy « Copié ! » sur les boutons (fait en P0 si mergé)
- Gate onboarding : billing accessible sans carte pour upgrade (voulu)

### 4.2 Marketing

**Points forts**
- Value prop, features, tarifs sur landing
- SEO metadata + OG image dynamique
- Personas documentés (`ProjectContext.txt`)

**Gaps**
- Pas de générateur gratuit sans compte (Phase 1 abandonnée)
- Pas de preuve sociale, démo vidéo, analytics
- `robots.txt` / `sitemap.xml` absents
- Nom repo « BetterPatcher » vs produit « Release Hub »

### 4.3 Communication

**Points forts**
- Ton FR direct, erreurs localisées

**Gaps**
- Emails transactionnels (bienvenue, essai fini) : non
- Page contact : mailto dans footer
- CGU / Confidentialité : pages minimales (P0) — **à personnaliser** (éditeur, SIRET, hébergeur)

### 4.4 Dev / Technique

**Points forts**
- API `/api/generate` : Zod, quotas, refund si IA échoue
- Webhooks Stripe signés, Supabase service role only, RLS
- Build production OK

**Gaps**
- Deploy prod non fait
- CI/CD absent
- Tests absents
- `npm run lint` : vérifier après fixes hooks
- `/api/env-check` : protégé en prod (secret query param)

### 4.5 Webdesign

**Points forts**
- Design system cohérent, shadcn, responsive
- OG image brandée

**Gaps**
- `prefers-reduced-motion` non géré
- Assets `public/` encore défaut Next/Vercel

### 4.6 Gestion de projet

**Fichiers de référence**
| Fichier | Rôle |
|---------|------|
| `docs/GO-LIVE.md` | Ce document |
| `Todo.txt` | Roadmap courte avec statuts |
| `ProjectContext.txt` | Vision, personas, règles vibe coding |
| `README.md` | Setup dev + checklist deploy |
| `.env.example` | Variables d'environnement |

**Décisions à documenter**
- [ ] Outil gratuit public : oui/non ?
- [ ] Plateforme deploy : Vercel (recommandé) vs Netlify vs Antigravity
- [ ] Prix final Stripe synchronisé avec `BILLING.PRO_PRICE_LABEL`

### 4.7 Argent / Business

**Modèle**
- Essai : 5 générations après vérif CB 0 €
- Pro : 10 €/mois, 60 générations/mois
- Protection coûts : plafonds caractères, intervalle min entre gen

**À faire avant encaissement**
- [ ] Stripe mode **live** (pas test)
- [ ] Customer Portal activé dans Stripe Dashboard
- [ ] Webhook prod configuré
- [ ] TVA / Stripe Tax si clients FR B2B
- [ ] Monitoring coûts API Gemini

---

## 5. Checklist go-live

> **Infra déjà en place ?** Voir `docs/VOTRE-TODO.md` — pas besoin de recréer Vercel/Supabase, seulement merger la PR, vérifier env vars et tester.

### P0 — Bloquants

- [ ] Merger PR #1 sur `master` (Vercel redéploie auto)
- [ ] Vérifier variables env Vercel (voir `docs/VOTRE-TODO.md`)
- [ ] Confirmer tables Supabase ; `waitlist.sql` seulement si absent
- [ ] Vérifier GitHub OAuth callback si connexion échoue
- [ ] Vérifier Stripe : webhook + **Customer Portal** activé
- [ ] Personnaliser `/legal/cgu` et `/legal/confidentialite`
- [ ] Tester parcours complet

### P1 — Crédibilité launch

- [x] CI GitHub Actions (lint + build)
- [ ] Analytics (Plausible / PostHog)
- [x] `robots.txt` + `sitemap.xml`
- [x] Messaging waitlist vs produit live
- [x] Rate limit `/api/waitlist`

### P2 — Post-launch

- [ ] Générateur gratuit landing (acquisition)
- [ ] Webhooks GitHub release
- [ ] Streaming réponse IA
- [ ] Tests automatisés (webhook, quotas, generate)
- [ ] Multi-projets / repos persistants

---

## 6. Variables d'environnement

Voir `.env.example`. Diagnostic :

- **Dev** : `http://localhost:3000/api/env-check`
- **Prod** : `https://<domaine>/api/env-check?secret=<ENV_CHECK_SECRET>`

---

## 7. Commandes utiles

```bash
npm install
npm run dev
npm run build
npm run lint
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 8. Contacts & liens

| Fichier | Contenu |
|---------|---------|
| `docs/VOTRE-TODO.md` | **Actions Guillaume** (merge, vérif env, Stripe, légal) |
| Repo | `GuillaumeWalter/BetterPatcher` |
| PR | #1 |
