# Ce que TU dois faire — Easy Patch

> **Bonne nouvelle :** je peux **pousser le code directement sur `master`** → Vercel redéploie tout seul.  
> Je n’ai **pas accès** à tes dashboards Vercel / Stripe / Resend — seulement au repo GitHub.

---

## Ce soir / demain (15 min max)

| # | Action | Où |
|---|--------|-----|
| 1 | Vérifier deploy Vercel ✅ | App Vercel ou PC |
| 2 | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Vercel env vars |
| 3 | `CRON_SECRET` (chaîne aléatoire) | Vercel env vars |
| 4 | Activer **Customer Portal** | Stripe dashboard |
| 5 | (Optionnel) `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Vercel |
| 6 | Tester signup → emails reçus | Ta boîte mail |
| 7 | Exécuter `supabase/integrations.sql` | Supabase SQL Editor |

**Tu n’as pas besoin de merger une PR** — je push sur `master` pour toi.

---

## Intégrations (10 min, optionnel)

1. **Supabase** → SQL Editor → coller `supabase/integrations.sql` → Run
2. **Dashboard → Settings** → choisir un repo pour les releases auto
3. Copier l’URL webhook → GitHub repo → Settings → Webhooks → Releases
4. (Optionnel) Coller un **Discord webhook** → bouton « Post to Discord » dans Share Studio
5. (Optionnel) `GITHUB_WEBHOOK_SECRET` sur Vercel si tu actives la signature HMAC GitHub

---

## Emails automatiques (déjà codés)

| Moment | Email |
|--------|-------|
| Inscription GitHub | Welcome 👋 |
| Carte vérifiée (€0) | Trial activated |
| 1 génération trial restante | Trial low |
| Dernière gen trial | Trial exhausted + offre Solo/Pro |
| Abo Solo/Pro confirmé | Subscription confirmed |
| Solo ≥ 80% quota mensuel | Upgrade to Pro |
| Solo ≤ 5 gen restantes | Solo quota low |
| Dernière gen Solo du mois | Solo quota exhausted |
| Trial activé mais inactif 3j+ | Inactive trial reminder (cron) |
| Inscription waitlist | Waitlist confirmation |
| Pro ≤ 10 gen restantes | Pro quota low |
| Dernière gen Pro du mois | Pro quota exhausted |
| Paiement échoué | Payment failed |
| Annulation abo | Subscription canceled |

Preview en local : `http://localhost:3000/api/emails/preview?template=welcome`  
Doc complète : `docs/emails.md` · Roadmap 10/10 : `docs/SCORE-10-10.md`

---

## Resend (10 min)

1. Compte sur [resend.com](https://resend.com)
2. Créer une API key → coller dans `RESEND_API_KEY` sur Vercel
3. Vérifier un domaine d’envoi ou utiliser le sandbox Resend en test

### 4. Analytics Plausible (optionnel, 5 min)

1. [plausible.io](https://plausible.io) → ajouter ton site
2. `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=easypatch.app` (ou ton domaine Vercel)

### 5. Légal (15 min)

Personnaliser avant lancement public :
- `/legal/terms`
- `/legal/privacy`
- Email `support@easypatch.app` dans footer/contact

### 6. Test rapide (10 min)

1. Landing → **Try free** (générateur sans compte)
2. GitHub login → carte 0 € → génération
3. Billing → **Manage subscription** (portail Stripe)
4. FAQ + Contact accessibles depuis le footer

---

## En cas de problème

| Symptôme | Solution |
|----------|----------|
| Rien ne change en prod | PR pas mergée, ou deploy Vercel en erreur |
| Demo « limit reached » | Normal (3/h/IP) — créer un compte |
| Pas d’email bienvenue | `RESEND_API_KEY` manquant (optionnel) |
| Stripe portal erreur | Activer Customer Portal dans Stripe |

---

## Ce que l’agent a livré

### Phase B
- Générateur gratuit landing, FAQ, Contact, légal, changelog
- Stripe Customer Portal, analytics Plausible

### Emails (nouveau)
- 12 templates HTML brandés
- Déclencheurs auto signup / trial / Solo / Stripe / waitlist
- Cron quotidien trial inactif
- Preview dev `/api/emails/preview`
