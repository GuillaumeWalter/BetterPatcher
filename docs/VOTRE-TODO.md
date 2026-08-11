# Ce que TU dois faire — Easy Patch

> **Important :** l’agent (moi) peut **pousser du code sur GitHub**, mais je n’ai **pas accès** à ton compte Vercel, Stripe, Supabase, ni à ton téléphone.  
> Toi seul peux cliquer « Merge » et configurer les dashboards.

---

## C’est quoi « merger la PR » ? (explication simple)

Imagine deux versions du code :

| Branche | Contenu |
|---------|---------|
| `master` | Ce qui tourne actuellement sur Vercel |
| `cursor/phase-b-8b37` | Le nouveau code (Phase B) que j’ai écrit |

Une **Pull Request (PR)** = une demande sur GitHub : « est-ce qu’on met ce nouveau code dans master ? »

**Merger** = appuyer sur le bouton vert **Merge pull request** sur GitHub.

**Ensuite :** si Vercel est déjà connecté au repo → il **redéploie tout seul** en 2–3 minutes. Tu n’as rien à faire sur Vercel sauf attendre.

### Sur téléphone (3 minutes)

1. Ouvre **GitHub** → repo `GuillaumeWalter/BetterPatcher`
2. Onglet **Pull requests** → ouvre la PR la plus récente (`phase-b` ou `quick-polish`)
3. Si GitHub dit **« conflicts »** → attends que l’agent les résolve, ou merge quand c’est vert
4. Bouton vert **Merge pull request** → **Confirm merge**
5. Onglet **Vercel** (app ou site) → vérifie que le dernier deploy est ✅

**Tu n’as PAS besoin de :**
- Reconnecter le repo Vercel
- Ré-exécuter les SQL `user_profiles` / `patch_notes` (déjà faits)

**Tu dois peut-être :**
- Ajouter de **nouvelles** variables d’environnement (voir ci-dessous)
- Activer le **Customer Portal** dans Stripe (1 clic)

---

## Checklist après merge

### 1. Variables Vercel (5 min)

Vercel → ton projet → **Settings → Environment Variables**

**Nouvelles (Phase B) — ajouter si absentes :**

| Variable | À quoi ça sert |
|----------|----------------|
| `RESEND_API_KEY` | Email de bienvenue (optionnel) |
| `RESEND_FROM_EMAIL` | Ex: `Easy Patch <hello@tondomaine.com>` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics (optionnel) — ton domaine sans `https://` |

**Déjà là normalement — juste vérifier :**
- `AUTH_*`, `SUPABASE_*`, `STRIPE_*`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_APP_URL`

Après ajout → **Deployments → Redeploy**

### 2. Stripe (5 min)

[dashboard.stripe.com](https://dashboard.stripe.com) → **Settings → Billing → Customer portal** → **Activer**

### 3. Resend emails (optionnel, 10 min)

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
