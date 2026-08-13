# Easy Patch

Turns a commit log (GitHub, GitLab, or pasted text) into a **Markdown patch note** plus a **social post**.

Stack: Next.js (App Router) · Auth.js (GitHub) · Stripe · Supabase · Vercel AI SDK · hosted on **Vercel**.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill values from docs/env-setup.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

| Doc | Purpose |
|-----|---------|
| [`TODO-GUILLAUME.md`](TODO-GUILLAUME.md) | Owner checklist — what remains (Guillaume) |
| [`docs/product-roadmap.md`](docs/product-roadmap.md) | Positioning, pricing, phases |
| [`docs/copywriting.md`](docs/copywriting.md) | English UI · no dash punctuation |
| [`docs/env-setup.md`](docs/env-setup.md) | Full env var reference (agent / co-dev) |
| [`docs/open-questions.md`](docs/open-questions.md) | Decisions still needed (Jira / Linear, etc.) |

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
