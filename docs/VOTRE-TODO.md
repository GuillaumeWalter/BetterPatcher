# Ce que TU dois faire — Easy Patch

> **Bonne nouvelle :** je peux **pousser le code directement sur `master`** → Vercel redéploie tout seul.  
> Je n’ai **pas accès** à tes dashboards Vercel / Stripe / Resend — seulement au repo GitHub.

---

## Ce soir / demain (15 min max)

| # | Action | Où |
|---|--------|-----|
| 1 | Vérifier deploy Vercel ✅ | App Vercel ou PC |
| 2 | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Vercel env vars |
| 3 | Activer **Customer Portal** | Stripe dashboard |
| 4 | (Optionnel) `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Vercel |
| 5 | Tester signup → emails reçus | Ta boîte mail |

**Tu n’as pas besoin de merger une PR** — je push sur `master` pour toi.

---

## Emails automatiques (déjà codés)

| Moment | Email |
|--------|-------|
| Inscription GitHub | Welcome 👋 |
| Carte vérifiée (€0) | Trial activated |
| 1 génération trial restante | Trial low |
| Dernière gen trial | Trial exhausted + offre Solo/Pro |
| Abo Solo/Pro confirmé | Subscription confirmed |
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

## Ce que l’agent a fait (Phase B)

- Générateur **gratuit sur la landing** (3 gen/h sans compte)
- FAQ, Contact, Terms, Privacy
- Footer + robots/sitemap
- Email bienvenue (Resend, si configuré)
- Stripe Customer Portal
- UX : skeleton quota, past_due, gate onboarding
- Analytics Plausible (si domaine configuré)
- Tests unitaires (quotas, rate limit)
