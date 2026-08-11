# Ce que Guillaume doit faire — Release Hub

> **Dernière mise à jour :** août 2026  
> **Contexte :** Vercel et Supabase sont déjà configurés. Pas besoin de tout recommencer.

---

## TL;DR

| Action | À refaire ? |
|--------|-------------|
| Connecter repo Vercel | **Non** — déjà fait |
| Créer projet Supabase | **Non** — déjà fait |
| SQL `user_profiles` + `patch_notes` | **Non** — déjà exécutés |
| **Merger la PR #1** | **Oui** — le nouveau code n’est pas sur `master` |
| Redéployer (auto si Git lié) | **Oui** — après merge |
| Vérifier variables env | **Oui** — pas tout recréer |
| SQL `waitlist` | **Seulement si** la table n’existe pas |
| Stripe live + webhook + Portal | **À vérifier** |
| Personnaliser pages légales | **Oui** — 15 min |

---

## 1. Merger et déployer le nouveau code (~5 min)

Le travail récent (légal, billing portal, fixes UX, docs) est sur la branche `cursor/quick-polish-8b37`, **PR #1** — pas encore sur `master`.

1. Ouvrir [PR #1](https://github.com/GuillaumeWalter/BetterPatcher/pull/1) sur GitHub
2. **Merger** la PR
3. Vercel redéploie automatiquement si le repo est lié — attendre le build vert

**Tu n’as pas besoin** de reconnecter le repo Vercel.

---

## 2. Vérifier Supabase (~2 min)

**Ne ré-exécute pas** `user_profiles.sql` ni `patch_notes.sql` si les tables existent déjà.

Dans Supabase → **Table Editor**, confirmer que tu vois :
- `user_profiles`
- `patch_notes`

**Optionnel** — seulement si absent :
- Table `waitlist_signups` → exécuter `supabase/waitlist.sql`

---

## 3. Vérifier les variables Vercel (~10 min)

Vercel → Project → **Settings → Environment Variables**

Comparer avec `.env.example`. **Ajouter** si manquantes (nouvelles dans la PR) :

| Variable | Notes |
|----------|--------|
| `ENV_CHECK_SECRET` | Générer un secret aléatoire — diagnostic prod |
| `NEXT_PUBLIC_APP_URL` | URL prod exacte (ex. `https://xxx.vercel.app`) |

**Vérifier** que celles-ci sont bien présentes (pas besoin de les recréer si déjà là) :
- `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY` (ou `AI_GATEWAY_API_KEY`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`

Après ajout → **Redeploy** (Deployments → Redeploy).

**Test :**  
`https://<ton-domaine>/api/env-check?secret=<ENV_CHECK_SECRET>`  
→ chaque champ doit être `true`.

---

## 4. GitHub OAuth (~2 min)

**Seulement si** le domaine a changé ou la connexion GitHub échoue.

GitHub → Settings → Developer settings → OAuth Apps → ton app  
→ **Authorization callback URL** = `https://<ton-domaine>/api/auth/callback/github`

---

## 5. Stripe (~15 min si pas déjà fait)

Dans [dashboard.stripe.com](https://dashboard.stripe.com) :

| Étape | Détail |
|-------|--------|
| Mode | **Live** pour encaisser (test pour beta interne) |
| Webhook | `https://<ton-domaine>/api/stripe/webhook` |
| Événements | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid` |
| **Customer Portal** | Settings → Billing → Customer portal → **Activer** (annulation self-service) |
| Prix Pro | `STRIPE_PRO_PRICE_ID` doit correspondre au prix créé |

---

## 6. Personnaliser le légal (~15 min)

Pages modèles (à compléter avant lancement public) :
- `/legal/cgu`
- `/legal/confidentialite`

Renseigner :
- Raison sociale, SIRET, adresse
- Email contact (footer : `contact@releasehub.app` — changer si besoin)
- Consulter un avocat pour version définitive si clients B2B

---

## 7. Test du parcours complet (~15 min)

Sur l’URL de prod, en mode test Stripe si besoin :

1. Landing → **Commencer avec GitHub**
2. Onboarding → carte 0 €
3. Générer un patch note
4. Vérifier historique
5. Billing → abonnement Pro (test) ou portail si déjà Pro
6. Liste d’attente sur la landing

---

## 8. Optionnel (post-beta)

- [ ] Analytics (Plausible, PostHog…)
- [ ] Email `contact@releasehub.app` ou autre
- [ ] Nom de domaine custom sur Vercel
- [ ] Basculer Stripe en live pour vrais paiements
- [ ] 5–10 beta testeurs + feedback

---

## Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `docs/GO-LIVE.md` | Analyse complète par domaine |
| `Todo.txt` | Roadmap produit |
| `.env.example` | Liste des variables |

---

## En cas de problème

| Symptôme | Piste |
|----------|-------|
| Connexion GitHub échoue | Callback URL OAuth |
| Génération 503 | Clé Gemini / AI Gateway |
| Quotas / historique vides | `SUPABASE_SERVICE_ROLE_KEY` |
| Stripe ne valide pas la carte | Webhook + `STRIPE_WEBHOOK_SECRET` |
| Abo Pro non activé | Webhook + `STRIPE_PRO_PRICE_ID` |
