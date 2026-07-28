# Easy Patch — Product roadmap

Document vivant. À relire avant toute évolution produit, billing ou intégrations.

## Positionnement

Easy Patch transforme un log de commits (ou collage manuel) en **patch note Markdown** + **post réseaux** (LinkedIn, X, Discord, Steam-style selon la tonalité).

Cible : indés, studios jeux, live ops, eng leads, product marketers.

## Grille tarifaire

| Palier | Prix | Quotas | Différenciation |
|--------|------|--------|-----------------|
| **Essai** | 0 € (CB anti-abus) | 5 générations one-shot | 1 user · GitHub import + collage |
| **Solo** | **4,99 € / mois** | **25** générations / mois | **1 utilisateur** · historique · mêmes sources / intégrations |
| **Pro** | **9,99 € / mois** | **80** générations / mois | **Équipe** : plusieurs users sur le même compte (sièges / invites) · quota partagé |

### Clarification « multi-connexions »

Ce n’est **pas** « plusieurs services (GitHub + Jira) réservés au Pro ».

**Multi-connexion = plusieurs utilisateurs rattachés au même compte / workspace entreprise** (inviter collègues, historique et quotas partagés). Différenciateur **Pro**.

Les intégrations (GitLab, Jira, Linear, etc.) sont une roadmap **pour tous les abonnés** (Solo inclus).

### Stripe (manuel Dashboard)

Créer deux Prices mensuels EUR :

- Solo → `STRIPE_SOLO_PRICE_ID` (4,99 €)
- Pro → `STRIPE_PRO_PRICE_ID` (9,99 €)

## Sources de commits

| Source | Statut |
|--------|--------|
| GitHub (OAuth + import repos/commits) | **Actuel** (aussi auth login) |
| Collage manuel (Perforce, Plastic / Unity Version Control, SVN, tout log texte) | **Actuel** |
| GitLab (import) | Roadmap — phase 1 |
| Jira / Linear (enrichir notes avec tickets) | Roadmap — phase 2 · Solo + Pro |
| Bitbucket | Plus tard |
| Trello | Nice-to-have, pas prioritaire |
| Perforce / Plastic API native | Non prévu (collage suffit) |

## Différenciateur Pro (équipe)

Workspaces / sièges : invite d’autres users sur le même compte entreprise, historique et quota partagés. **Copy / pricing prêts** ; implémentation seats = phase ultérieure.

## Backlog idées

- Sièges équipe / workspaces (Pro)
- Import GitLab
- Jira / Linear → titres de tickets dans les patch notes
- Auto-générer sur tag / GitHub Release
- Brand voice / mémoire de ton studio
- Multi-langue des patch notes
- Format Steam News dédié
- Publish Discord (pas seulement générer)
- Abonnement annuel (-15 %)
- Bitbucket
- Trello (nice-to-have)

## Phases

### Phase 0 (cette passe)

- Doc produit + pointeur AGENTS
- Paliers Essai / Solo / Pro (quotas + Stripe dual price)
- Retirer messaging « Beta »
- Copy sources (Perforce / Plastic / SVN + teaser GitLab / Jira, **pas** gated Pro)

### Phase 1

- Import GitLab

### Phase 2

- Jira ou Linear (enrichissement tickets) — Solo + Pro

### Phase 3

- Workspaces / invites multi-users (différenciateur Pro réel)
- Bitbucket, Discord publish, auto-release, annuel, etc.

## Market & comm (à traiter prochainement)

Principe : **attendre que le produit soit suffisamment terminé** (essai → Solo/Pro fluide, génération fiable, copy claire) avant de pousser pubs et listings. Sinon on brûle budget et premier contact sur un outil encore bancal.

### Timing

| Action | Quand |
|--------|--------|
| Contenu organique léger (posts, communautés) | OK tôt, volume faible — tester le message |
| Pubs payantes (~100 € / mois) | **Après** outil prêt (flow essai → payant OK) |
| Product Hunt / AlternativeTo / G2 | **Après** outil prêt + 1–2 témoignages ou screenshots solides |
| PWA « Installer l’app » | Dès que l’UI dashboard est stable |
| GitHub Action (tag/release → patch note) | Après core fiable — **meilleur levier récurrence** |
| Raycast / Alfred / extension navigateur | Après core ; point d’entrée secondaire |
| Bot Discord / Slack (publish) | Plus tard (aligné backlog Discord publish) |

### Budget pubs (ordre d’idée)

~**100 € / mois** pour démarrer, concentré :

- **LinkedIn** (60–80 €) — ICP B2B (indés, studios, eng / product) ; 1 créatif « commits → patch note + post »
- Reste éventuel : test X / Meta si besoin
- Mesurer les **essais GitHub**, pas les likes
- En parallèle (0 €) : Reddit / Discord / forums (r/gamedev, r/indiedev, serveurs studios)

### Plateformes — sous la main (récurrence)

1. **GitHub Action / GitHub App** — tag/release → patch note (priorité #1 récurrence ; déjà dans backlog « Auto-générer sur tag »)
2. **PWA** — icône bureau / dock
3. **Raycast** (ou Alfred) — raccourci clavier
4. **Extension navigateur** — accès rapide depuis GitHub Releases
5. **Bot Discord / Slack** — plus tard

### Plateformes — listings (découverte)

- Product Hunt (1 lancement soigné)
- AlternativeTo ; éventuellement G2 / Capterra
- Indie Hackers, forums Steamworks / communautés indés
- Chrome Web Store **seulement** si vraie extension utile

### Ordre d’exécution (quand on s’y met)

1. Produit prêt + pubs LinkedIn ciblées + organique communautés
2. PWA install
3. GitHub Action
4. Raycast ou extension Chrome
5. Product Hunt
