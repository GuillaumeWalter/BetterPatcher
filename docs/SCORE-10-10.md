# Roadmap 10/10 — Easy Patch

> What “10/10” means per area, current score, and who does what.  
> Updated: August 2026 (v0.6.1)

## Scores actuels

| Domaine | Score | 10/10 = |
|---------|-------|---------|
| **Fonctionnel (cœur produit)** | **10/10** | Génération, Share Studio copy-first, team history, Linear |
| **UX/UI** | 9/10 | Onboarding guidé livré · beta testeurs à faire |
| **Marketing** | 8/10 | Démo vidéo, témoignages, analytics actif |
| **Communication** | 8.5/10 | Emails auto + légal template enrichi |
| **Dev/Ops** | 9.5/10 | Rate limits Supabase · E2E public · beta testeurs |
| **Webdesign** | 8/10 | Screenshots prod, a11y WCAG AA |
| **Gestion projet** | 9/10 | Todo + open-questions à jour · beta côté toi |
| **Argent** | 6/10 | Stripe live, MRR (côté toi) |

---

## Cœur produit — 10/10 ✅ (agent)

### Livré (v0.6.0)

- Génération IA streaming + quotas trial / Solo / Pro
- Sources : GitHub, GitLab, paste (tout VCS)
- Share Studio : markdown éditable, drafts multi-plateformes, copy, regenerate one + **regenerate all**
- Discord publish (webhook) + bot slash `/easypatch`
- Historique persistant + **historique partagé Pro team** (lecture + copy)
- Linear ticket enrichment (Solo + Pro)
- Onboarding : carte €0 → **guide 4 étapes** sur dashboard / generator
- Favoris repos, team seats, annual billing, RGPD delete, PWA, Sentry
- Emails lifecycle, setup checklist widget

### 🔲 Toi (dashboards)

Voir **`docs/A-FAIRE-MAINTENANT.md`** (checklist complète).

Résumé 15 min :

1. Exécuter **2 SQL nouveaux** si pas fait (`rate_limits.sql`, `scheduled_posts.sql`)
2. Vercel env vars obligatoires + redeploy
3. Stripe Customer Portal + webhook + prices
4. Resend + domaine
5. Tester : signup → onboarding → 1 génération → Share Studio copy

### 🔲 Plus tard (hors cœur produit)

- Schedule Discord / cron publish
- GitHub Action (tag → patch note)
- Jira, OAuth social publish (Meta / X / LinkedIn)
- Brand voice memory

---

## UX — 9 → 10

### ✅ Fait (agent)

- Onboarding guidé post-trial (**4 steps tracked** : import → generate → share → history)
- Empty states + “Load sample commits”
- Bannière welcome après activation carte
- Rate limits demo + regenerate (anti-abus Gemini)

### 🔲 Toi

- [ ] 5 beta testeurs, noter friction
- [ ] Feedback → agent polish ciblé

---

## Argent — 6 → 10

### 🔲 Toi

- [ ] Stripe **Customer Portal** activé
- [ ] Mode **live** quand prêt à encaisser
- [ ] Stripe Tax si clients FR B2B
- [ ] Suivre MRR dans Stripe dashboard

---

## Marketing — 8 → 10

### 🔲 Toi

- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` sur Vercel
- [ ] Enregistrer 30s Loom / GIF sur la landing
- [ ] 2–3 citations beta testeurs
- [ ] Domaine custom

---

## Communication — 8.5 → 10

### 🔲 Toi

- [ ] Resend + `CRON_SECRET` sur Vercel
- [ ] Tester signup → welcome + trial activated

---

## Dev/Ops — 9 → 10

### ✅ Fait

- Sentry SDK, CI lint + test + build + Playwright E2E
- Tests quotas, team, drafts, tickets
- **Rate limits** Supabase (`rate_limits.sql`) + fallback mémoire

### 🔲 Toi

- [ ] Vérifier deploy Vercel vert après chaque push `master`

---

Voir aussi `docs/VOTRE-TODO.md` et `docs/A-FAIRE-MAINTENANT.md`.
