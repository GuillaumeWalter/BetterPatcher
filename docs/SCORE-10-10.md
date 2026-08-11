# Roadmap 10/10 — Easy Patch

> What “10/10” means per area, current score, and who does what.  
> Updated: August 2026

## Scores actuels (après Phase B + emails)

| Domaine | Score | 10/10 = |
|---------|-------|---------|
| **Fonctionnel** | 9/10 | Multi-repo favoris, streaming done |
| **UX/UI** | 8.5/10 | Beta testée, zero état silencieux |
| **Marketing** | 8/10 | Démo vidéo, témoignages, analytics actif |
| **Communication** | 8.5/10 | Emails auto + légal template enrichi |
| **Dev/Ops** | 8.5/10 | E2E Playwright, monitoring scaffold, tests |
| **Webdesign** | 8/10 | Screenshots prod, a11y WCAG AA |
| **Gestion projet** | 7/10 | Beta structurée, changelog public |
| **Argent** | 6/10 | Stripe live, MRR, Stripe Tax |

---

## Communication — 8.5 → 10

### ✅ Fait (agent)
- 12 templates email (bienvenue, trial, Solo quota, upgrade, waitlist…)
- Déclencheurs : signup, Stripe webhook, génération trial/Solo
- Cron quotidien rappel trial inactif (`vercel.json` + `CRON_SECRET`)
- Preview dev : `/api/emails/preview?template=welcome`
- Doc : `docs/emails.md`

### 🔲 Toi (ce soir / demain)
- [ ] Compte [Resend](https://resend.com) + `RESEND_API_KEY` sur Vercel
- [ ] Vérifier domaine d’envoi + `RESEND_FROM_EMAIL`
- [ ] `CRON_SECRET` sur Vercel (chaîne aléatoire longue)
- [ ] Tester : signup → welcome + trial activated

### 🔲 Plus tard
- [ ] Légal finalisé par avocat

---

## Marketing — 7 → 10

### ✅ Fait
- Demo landing, FAQ, SEO, sitemap

### 🔲 Toi
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` sur Vercel
- [ ] Enregistrer 30s Loom / GIF sur la landing
- [ ] 2–3 citations beta testeurs
- [ ] Domaine custom

---

## Argent — 6 → 10

### 🔲 Toi
- [ ] Stripe **Customer Portal** activé
- [ ] Mode **live** quand prêt à encaisser
- [ ] Stripe Tax si clients FR B2B
- [ ] Suivre MRR dans Stripe dashboard

---

## Fonctionnel — 9 → 10

### ✅ Fait (agent)
- Streaming IA (NDJSON `/api/generate/stream`)
- Webhook GitHub Release + page Settings
- Discord publish depuis Share Studio

### 🔲 Agent
- [ ] Multi-projets / repos favoris persistants
- [ ] Discord schedule (cron)

### 🔲 Toi (Settings)
- [ ] Exécuter `supabase/integrations.sql` dans Supabase SQL Editor
- [ ] Dashboard → Settings → choisir repo + coller webhook GitHub
- [ ] (Optionnel) `GITHUB_WEBHOOK_SECRET` sur Vercel si tu veux signature HMAC globale

---

## Dev/Ops — 8.5 → 10

### ✅ Fait
- CI lint + test + build + Playwright E2E
- Tests quotas, rate limit, parse-request, commits, drafts
- `captureException` scaffold + `instrumentation.ts`
- Vitest + Playwright séparés

### 🔲 Agent
- [ ] Sentry SDK complet (`@sentry/nextjs`)
- [ ] Alertes coût Gemini

### 🔲 Toi
- [ ] Vérifier deploy Vercel vert après chaque push `master`

---

## UX — 8 → 10

### 🔲 Toi
- [ ] 5 beta testeurs, noter friction
- [ ] Feedback → agent polish

---

## Ta checklist rapide (15 min)

1. Vercel → `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
2. Stripe → Customer Portal ON
3. (Optionnel) Plausible domain
4. Tester signup + 1 génération + email reçu

Voir aussi `docs/VOTRE-TODO.md`.
