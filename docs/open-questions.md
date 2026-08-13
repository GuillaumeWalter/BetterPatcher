# Easy Patch | Open questions

Decisions for **post-core** work. Core product (v0.6) decisions are recorded below as **resolved**.

---

## Resolved (shipped in code)

### Linear ticket enrichment ✅

- **Provider:** Linear first (Jira later)
- **Auth:** OAuth connect (same pattern as GitLab)
- **Match:** Parse keys in commits (`ENG-42`, `PROJ-123`)
- **Depth:** Titles (+ state in preview panel)
- **UI:** Auto-enrich on generate + ticket preview panel in generator
- **Trial access:** **Solo + Pro only** (trial sees keys, not titles until subscribe)

### Pro team seats ✅

- Invite by email → teammate signs in with matching GitHub email
- Shared monthly quota + **shared history** (read/copy for teammates)
- Seat cap: **5** on Pro (`BILLING.PRO_MAX_TEAM_SEATS`)

### Annual plan ✅

- −15% toggle in billing UI; Stripe yearly Price IDs in env

### Share Studio P0 ✅

- Editable markdown, per-platform drafts, copy, regenerate, Discord webhook publish
- **Not shipped:** schedule, social OAuth publish

### Rate limits ✅

- Demo: 3/hour/IP (durable via `supabase/rate_limits.sql` when applied)
- Draft regeneration: 40 AI calls/hour/user (each platform in “regenerate all” = 1 call)

---

## Still open

### 1. Jira vs Linear second provider

Linear is live. Add Jira Cloud in parallel or wait for user demand?

**Suggested default:** wait until 3+ beta users ask for Jira.

### 2. Linear on Trial?

Today trial users can connect Linear but enrichment runs only on Solo/Pro.

- **Keep as is** (lighter trial, upgrade hook), or
- **Allow titles on trial** (better demo, more API cost)

### 3. Waitlist on landing

`WaitlistSection` + `/api/waitlist` exist but section is **not mounted**.

- Keep hidden until after beta?
- Or soft “notify me” under pricing?

### 4. Team invite UX

Email-only invite is fragile (wrong GitHub email = stuck pending).

- Add magic invite link later?
- Or document clearly in Settings?

### 5. Integration secrets at rest

Discord webhook, GitHub/GitLab/Linear tokens stored as plaintext in Supabase.

- OK for MVP?
- Or encrypt with app secret before go-live in EU enterprise?

### 6. Post-core priority order

Shipped: Discord schedule · GitHub Action.

Next for agent:

1. Jira  
2. Social OAuth  
3. Brand voice memory

---

## Nice to confirm later (not blocking)

- Dedicated Steam News BBCode export vs current paste format
- Output language override (today: inferred from commits)
- Mount or remove dormant `WaitlistSection`
