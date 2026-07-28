# Easy Patch | Product roadmap

Living doc. Re-read before product, billing, or integration work.

**Hosting:** Vercel. **UI language:** English (see `docs/copywriting.md`).

## Positioning

Easy Patch turns a commit log (or pasted text) into a **Markdown patch note** plus a **social post** (LinkedIn, X, Discord, Steam-style by tone).

Audience: indies, game studios, live ops, eng leads, product marketers.

## Pricing

| Tier | Price | Quotas | Differentiation |
|------|-------|--------|-----------------|
| **Trial** | €0 (card required to limit abuse) | 5 one-time generations | 1 user | GitHub import + paste |
| **Solo** | **€4.99 / month** | **25** generations / month | **1 user** | history | same sources / integrations as they ship |
| **Pro** | **€9.99 / month** | **80** generations / month | **Team**: several users on one account (seats / invites) | shared quota |

### Multi-seat clarification

This is **not** “several services (GitHub + Jira) locked to Pro”.

**Multi-seat** means several people on the same company account / workspace (invites, shared history and quotas). That is the **Pro** differentiator.

Integrations (GitLab, Jira, Linear, etc.) are a roadmap for **all subscribers** (Solo included).

### Stripe (Dashboard, manual)

Create two monthly EUR Prices:

- Solo → `STRIPE_SOLO_PRICE_ID` (€4.99)
- Pro → `STRIPE_PRO_PRICE_ID` (€9.99)

Also run `supabase/plan_tiers.sql` and `supabase/gitlab_token.sql` on the Supabase project.

### GitLab OAuth (Vercel env)

Create a GitLab OAuth Application (gitlab.com → Applications):

- Redirect URI: `https://YOUR_DOMAIN/api/gitlab/callback`
- Scopes: `read_user`, `read_api`
- Env: `AUTH_GITLAB_ID`, `AUTH_GITLAB_SECRET` (optional `GITLAB_BASE_URL` for self-hosted)

## Commit sources

| Source | Status |
|--------|--------|
| GitHub (OAuth + repo/commit import) | **Current** (also login) |
| Manual paste (Perforce, Plastic / Unity Version Control, SVN, any text log) | **Current** |
| GitLab (import) | **Current** (OAuth link · Solo + Pro + Trial) |
| Jira / Linear (ticket titles into notes) | Phase 2 | Solo + Pro |
| Bitbucket | Later |
| Trello | Nice to have |
| Native Perforce / Plastic API | Not planned (paste is enough) |

## Pro differentiator (team)

Workspaces / seats: invite teammates to one company account, shared history and quota. **Copy and pricing are ready**; real seats come later.

## Backlog

- Team seats / workspaces (Pro)
- GitLab import
- Jira / Linear → ticket titles in patch notes
- Auto-generate on tag / GitHub Release
- Brand voice / studio tone memory
- Multi-language patch notes
- Dedicated Steam News format
- Discord publish (not only generate)
- Annual plan (15% off)
- Bitbucket
- Trello (nice to have)

## Phases

### Phase 0 (done)

- Product doc + AGENTS pointer
- Trial / Solo / Pro (quotas + dual Stripe prices)
- Remove Beta messaging
- Source copy (Perforce / Plastic / SVN + GitLab / Jira teaser, not Pro-gated)
- Rebrand to Easy Patch

### Phase 0.5 (done)

- Full English UI
- Copywriting rules (no dash punctuation · middle dot `·` allowed)
- Vercel hosting · Stripe / Supabase ops for Solo / Pro

### Phase 1 (done)

- GitLab import (OAuth connect linked to existing account · last 30 commits)

### Phase 2 (next)

- Jira or Linear (ticket enrichment) | Solo + Pro

### Phase 3

- Workspaces / multi-user invites (real Pro differentiator)
- Bitbucket, Discord publish, auto-release, annual, etc.

## GTM (later)

Wait until the product is solid (trial → Solo/Pro smooth, generation reliable, clear copy) before paid ads and big listings.

| Action | When |
|--------|------|
| Light organic (posts, communities) | Early OK, low volume |
| Paid ads (~€100 / month) | After the tool is ready |
| Product Hunt / AlternativeTo / G2 | After ready + 1 to 2 testimonials or solid screenshots |
| PWA “Install app” | When dashboard UI is stable |
| GitHub Action (tag/release → patch note) | After core is reliable (best recurrence lever) |
| Raycast / Alfred / browser extension | After core |
| Discord / Slack bot | Later |

### Suggested ad mix

~**€100 / month** to start:

- LinkedIn (60 to 80 €): B2B ICP | creative “commits → patch note + post”
- Measure **GitHub trial signups**, not likes
- Free: Reddit / Discord / forums (r/gamedev, r/indiedev)

### Execution order (when GTM starts)

1. Product ready + LinkedIn + organic communities
2. PWA
3. GitHub Action
4. Raycast or Chrome extension
5. Product Hunt
