# Easy Patch | Open questions

Decisions still needed from you. Code can stay blocked or teaser-only until these are answered. No dashboards required to reply here.

## Phase 2: Jira / Linear ticket enrichment

Roadmap: Solo + Pro (not Pro-gated as an exclusive feature). Trial currently gets GitLab; clarify Trial for tickets.

1. **Provider order:** Jira first, Linear first, or both in parallel?
2. **Auth model:** OAuth app (Connect button) or personal API token pasted by the user? (OAuth is nicer for teams; tokens are faster to ship for Solo.)
3. **Match strategy:**
   - Parse ticket keys in commit messages (`PROJ-123`, `ABC-9`) and fetch titles, or
   - Pick a project / board and pull recent tickets into the note, or
   - Both?
4. **Enrichment depth:** Titles only (MVP) vs titles + status / epic / labels?
5. **UI placement:** Separate “Jira / Linear” source tab, or auto-enrich whenever keys appear in pasted / imported commits?
6. **Trial access:** Same as GitLab (yes), or Solo + Pro only?

Suggested default if you want me to proceed without more debate:

- Linear first (simpler API than Jira Cloud)
- OAuth connect linked to the existing account (same pattern as GitLab)
- Parse keys in commits + optional project picker
- Titles only for MVP
- Auto-enrich on generate when keys are present
- Solo + Pro only (keep Trial lighter)

## Waitlist on the landing page

`WaitlistSection` + `/api/waitlist` + `supabase/waitlist.sql` exist but the section is **not mounted**. GTM in the roadmap says wait until the product is solid.

- Keep hidden until trial → Solo / Pro feels smooth?
- Or show a soft “notify me about team seats” waitlist under pricing?

## Pro seats (Phase 3)

Copy already says “several users on one account (coming soon)”.

- Invite by email into a shared workspace?
- Shared history + shared monthly quota (current positioning)?
- Seat cap on Pro (e.g. 5) vs unlimited?

## Nice to confirm later (not blocking)

- Dedicated Steam News format vs current gaming tone
- Output language override (today: detect from commits)
- Annual plan (15% off) when Stripe Prices exist
