# Ce que TU dois faire — Easy Patch

> **Checklist active (Guillaume, setup déjà fait) :** [A-FAIRE-MAINTENANT.md](./A-FAIRE-MAINTENANT.md)

---

## En bref — ne refais pas tout

| Déjà OK | Reste (delta) |
|---------|----------------|
| Supabase SQL base | `rate_limits.sql` + `scheduled_posts.sql` si pas fait |
| Vercel (Auth, Supabase, Stripe, Gemini, GitLab) | `CRON_SECRET` · Resend · optionnels |
| Stripe prices + webhook sur Vercel | Customer Portal · mode Live quand prêt |

---

## Prochaines actions utiles

1. Exécuter **2 SQL** nouveaux (si pas fait) → voir A-FAIRE-MAINTENANT §1  
2. Ajouter **`CRON_SECRET`** si schedule Discord ou emails cron  
3. **Test prod** : login → gen → Share Studio → billing  
4. **5 beta testeurs** avant pub

---

## Références

- Install from scratch : [setup-premiere-fois.md](./setup-premiere-fois.md)  
- Emails auto : [emails.md](./emails.md)  
- GitHub Action : [github-action.md](./github-action.md)  
- Audit : [SCORE-10-10.md](./SCORE-10-10.md)

**L’agent push sur `master`** → Vercel redéploie. Pas besoin de merger une PR.
