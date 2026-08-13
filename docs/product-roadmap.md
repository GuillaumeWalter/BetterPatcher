# Easy Patch | Product roadmap

Living doc. Re-read before product, billing, or integration work.

**Hosting:** Vercel. **UI language:** English (see `docs/copywriting.md`).

## Positioning

Easy Patch turns a commit log (or pasted text) into a **Markdown patch note** plus **platform-ready social drafts** (LinkedIn, X, Discord, Steam-style, etc.). Share Studio (roadmap) adds edit → adapt → copy / publish / schedule.

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

Create monthly Prices per currency (same Product Solo / Product Pro):

| Currency | Solo | Pro | Env vars |
|----------|------|-----|----------|
| EUR (default) | 4.99 | 9.99 | `STRIPE_SOLO_PRICE_ID` · `STRIPE_PRO_PRICE_ID` |
| USD | 4.99 | 9.99 | `STRIPE_SOLO_PRICE_ID_USD` · `STRIPE_PRO_PRICE_ID_USD` |
| GBP | 4.99 | 9.99 | `STRIPE_SOLO_PRICE_ID_GBP` · `STRIPE_PRO_PRICE_ID_GBP` |
| JPY (zero-decimal) | 740 | 1480 | `STRIPE_SOLO_PRICE_ID_JPY` · `STRIPE_PRO_PRICE_ID_JPY` |
| KRW (zero-decimal) | 6900 | 13900 | `STRIPE_SOLO_PRICE_ID_KRW` · `STRIPE_PRO_PRICE_ID_KRW` |

Geo (`x-vercel-ip-country`) picks currency for setup + subscribe. Missing local Price → falls back to EUR.

Also run `supabase/plan_tiers.sql` and `supabase/gitlab_token.sql` on the Supabase project.

### GitLab OAuth (Vercel env)

Create a GitLab OAuth Application (gitlab.com → Applications):

- Redirect URI: `https://YOUR_DOMAIN/api/gitlab/callback`
- Scopes: `read_user`, `read_api`
- Env: `AUTH_GITLAB_ID`, `AUTH_GITLAB_SECRET` (optional `GITLAB_BASE_URL` for self-hosted)

## Commit sources

| Source | Status |
|--------|--------|
| GitHub (OAuth + repo/commit import) | **Shipped** |
| Manual paste (Perforce, Plastic, SVN, any text log) | **Shipped** |
| GitLab (import) | **Shipped** |
| Linear (ticket titles into notes) | **Shipped** (Solo + Pro) |
| Jira | Phase 3 |
| Bitbucket | Later |

## Pro differentiator (team)

Workspaces / seats: invite teammates, **shared quota and shared history** (read + copy). Owners edit; members view team notes.

## Backlog (post-core)

- Discord schedule (cron publish)
- GitHub Action (tag/release → patch note)
- Jira ticket enrichment
- Brand voice / studio tone memory
- Multi-language patch notes
- Social OAuth publish (Meta / X / LinkedIn) — see `docs/share-and-publish.md`
- Bitbucket, Trello

Ops checklists: `docs/A-FAIRE-MAINTENANT.md` · `docs/env-setup.md`

## Phases

### Phase 0–1 (done)

Trial / Solo / Pro, GitLab, English UI, Vercel hosting

### Phase 2 (done — core product)

- Linear ticket enrichment
- **Share Studio P0** : editable markdown, per-platform drafts, copy, regenerate, Discord publish
- Guided onboarding, team shared history, regenerate all drafts

### Phase 2.5 (done — v0.7)

- Discord **schedule** (Share Studio + cron every 5 min)
- **GitHub Action** template + `/api/action/generate`

### Phase 3 (next)

- Jira
- Social OAuth publish where APIs allow
- Brand voice memory

### Phase 4

- Bitbucket, Raycast extension, Product Hunt GTM

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
| Discord / Slack bot | After Share Studio webhook path (see `docs/share-and-publish.md`) |

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
