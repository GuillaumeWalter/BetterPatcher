# Roadmap 10/10 — Easy Patch

> What “10/10” means per area, current score, and who does what.  
> Updated: August 2026

## Scores actuels (après Phase B + emails)

| Domaine | Score | 10/10 = |
|---------|-------|---------|
| **Fonctionnel** | 8.5/10 | Webhooks release, multi-repo, streaming IA |
| **UX/UI** | 8/10 | Beta testée, zero état silencieux |
| **Marketing** | 7/10 | Démo vidéo, témoignages, analytics actif |
| **Communication** | 8/10 | Emails auto + légal finalisé |
| **Dev/Ops** | 7.5/10 | E2E, Sentry, monitoring coûts IA |
| **Webdesign** | 8/10 | Screenshots prod, a11y WCAG AA |
| **Gestion projet** | 7/10 | Beta structurée, changelog public |
| **Argent** | 6/10 | Stripe live, MRR, Stripe Tax |

---

## Communication — 8 → 10

### ✅ Fait (agent)
- 9 templates email (bienvenue, trial, upgrade, paiement…)
- Déclencheurs : signup, Stripe webhook, génération trial
- Preview dev : `/api/emails/preview?template=welcome`
- Doc : `docs/emails.md`

### 🔲 Toi (ce soir / demain)
- [ ] Compte [Resend](https://resend.com) + `RESEND_API_KEY` sur Vercel
- [ ] Vérifier domaine d’envoi + `RESEND_FROM_EMAIL`
- [ ] Tester : signup → recevoir welcome + trial activated

### 🔲 Plus tard
- [ ] Cron rappel inactifs (template prêt, pas câblé)
- [ ] Email upgrade Solo→Pro après 80% quota mensuel
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

## Fonctionnel — 8.5 → 10

### 🔲 Agent (prochaines sessions)
- [ ] Webhooks GitHub release → génération auto
- [ ] Streaming réponse IA
- [ ] Multi-projets persistants

---

## Dev/Ops — 7.5 → 10

### ✅ Fait
- CI lint + test + build
- Tests quotas + rate limit

### 🔲 Agent
- [ ] E2E Playwright (signup → generate)
- [ ] Sentry (`SENTRY_DSN`)
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
