# Easy Patch | Share & publish

Product design for post-generation sharing: edit → adapt per platform → publish or schedule.

**Status:** P0 shipped · P1 **Discord schedule shipped** (v0.7) · social OAuth not shipped yet.  
**UI language:** English. **Hosting:** Vercel.

---

## Problem

Today Easy Patch generates one Markdown patch note + **one** `social_post` (tone-shaped), then users **copy**. There is no:

- Multi-platform draft set
- Manual edit flow before share (generator results are read-only; history allows edit)
- Discord publish or schedule
- Account linking for networks
- Media attachment per platform
- Steam News oriented format beyond “gaming” tone wording

Indies and studios need: generate once → polish → post (or schedule) where their community lives.

---

## Product principle

**One source of truth, many platform drafts.**

1. **Canonical markdown** (the patch note) remains the primary artifact.
2. **Platform drafts** are derived variants the user can edit before any share.
3. **Publish** is optional and progressive: Copy first, then Discord, then other networks as APIs allow.
4. **Tone** (Technical / Marketing / Gaming) still steers voice; **platform presets** steers length, structure, media, and CTA.

Do not conflate tone with platform. A Gaming tone on Discord and the same Gaming tone on X should produce different drafts.

---

## UX: Share Studio

Entry points:

- After generate (primary CTA: **Share**)
- History detail (existing edit + new Share)

### Layout (one job per section)

1. **Patch note**  
   Editable markdown with live preview. Save updates `patch_notes.markdown`.

2. **Platform picker**  
   Multi-select: Discord · X · LinkedIn · Threads · Instagram · Facebook · Steam · Slack (copy).  
   Default selection follows tone (e.g. Gaming → Discord + Steam + X).

3. **Draft panel (per selected platform)**  
   Editable text + platform-specific fields (link, media, feeling/activity for Facebook if we support it later).  
   Actions: Regenerate for this platform · Copy · Publish now · Schedule.

4. **Connections** (Settings)  
   Linked accounts / webhooks. Status: Connected · Needs reconnect · Not available.

Generator results should become editable (or open Share Studio immediately) so users never hit a dead end of “copy only from read-only fields.”

---

## Platform content rules (generation)

Presets feed the AI when generating or regenerating a draft. Users can always override manually.

| Platform | Length / structure | Link | Media | Notes |
|----------|-------------------|------|-------|--------|
| **Discord** | Markdown friendly; short intro + bullets or embed fields; ~1–2k chars soft target | Optional URL in content or embed | Image/file optional | Prefer webhook or bot post to `#announcements` |
| **X** | Punchy; aim ≤280 for single post, or thread (1 hook + 2–4 beats) | Prefer link in last beat or reply (API charges more for URL posts) | Image optional | Hashtags: 0–2 max |
| **LinkedIn** | Hook + 3–5 bullets + soft CTA; ~500–1,300 chars | Link OK | Image optional | Matches current Marketing social style |
| **Threads** | Conversational; ~300–800 chars; first URL can drive link preview | 1 primary URL | Image / video / text | Cap total links (Meta limit) |
| **Instagram** | **Feed / carousel:** long storytelling caption OK (hook in first ~125 chars before “more”; body can go long for saves). **Reels:** short caption (often &lt;100 chars) | No arbitrary outbound links in caption (link in bio / Stories sticker); put store / patch URL in bio tip | **Required** image or reel for real publish | Hashtags: 3–5 niche tags at end |
| **Facebook** | Mid length; community tone; optional feeling/activity later | Link OK | Image / video common | Page publish via Meta, not personal scrape |
| **Steam** | Title + description bullets; Steam News / Patch Notes style (BBCode-ish or plain list ready to paste) | Steamworks has no public create-news API for us | Images via Steamworks UI | **Generate + copy** into Steamworks (see Steam section) |
| **Slack** | Short eng update (existing Technical social style) | Link OK | Rare | Copy or incoming webhook later |

### Tone × platform

| Tone | Suggested default platforms |
|------|-----------------------------|
| Technical | Slack · Discord · LinkedIn (light) |
| Marketing | LinkedIn · X · Threads · Facebook |
| Gaming | Discord · Steam · X · Instagram · Threads |

Regenerate uses: canonical markdown + selected tone + platform preset + optional user instruction (“more hype”, “more factual”).

---

## Discord (priority publish path)

Roadmap already lists Discord publish and a Discord / Slack bot as later GTM. For product value, ship in two layers:

### Layer A: Site-integrated webhook (ship first)

- User pastes an **incoming webhook URL** (or creates one via Discord channel settings) and stores it on their profile (`discord_webhook_url` in Supabase; **plaintext at rest** today).
- Easy Patch POSTs content (and optional embed) now or at `scheduled_at`.
- Scheduling: Vercel Cron or queue table polled by a cron route (Discord has **no** native schedule API).
- Pros: simple, no bot invite friction, fits Vercel. Cons: one channel per webhook; no slash commands.

### Layer B: Discord bot (ship next)

- Bot joins the server; user maps `#channel` in Easy Patch Settings.
- Slash commands e.g. `/easypatch schedule`, `/easypatch post` for power users.
- Same scheduler backend as Layer A.
- Pros: channel picker, richer UX, brand presence. Cons: Discord app review, permissions, hosting for gateway if interactive (Interactions Endpoint URL can stay HTTP-only for slash commands).

**Recommendation:** build Share Studio + webhook publish + schedule first; add bot when webhook path is stable.

---

## Other networks (realistic API constraints)

### Copy / export (always available)

Every platform draft supports **Copy** and optionally **Open compose URL** where deep links exist. This is the safe baseline when OAuth is blocked or costly.

### X (Twitter)

- Official API is **pay-per-use** for new apps (writes billed; posts **with URL** cost more).
- Prefer: excellent X draft + thread mode + Copy / “Tweet intent” link.
- Optional later: OAuth publish with Easy Patch bearing API cost, or BYOK (user’s keys) for Pro.

### Meta: Facebook · Instagram · Threads

- Publishing needs Meta app, OAuth, and **App Review** (Advanced Access for multi-tenant SaaS).
- Instagram Content Publishing needs a professional account + media hosted on a public URL (Blob storage).
- Facebook Page publish (not casual profile “feeling” without Page tokens); feeling/activity is a nice-to-have after basic Page posts work.
- Threads has a dedicated publish API (text / image / video / carousel).

**Recommendation:** generate Meta-ready drafts + media upload UX early; wire OAuth publish after Discord is live and App Review is prepared (privacy policy, data deletion, screencasts).

### LinkedIn

- Marketing posts already close to LinkedIn style.
- Official posting APIs need LinkedIn developer products and review. Same pattern: draft + copy first, OAuth later.

### Steam

- Steamworks **Events & Announcements** (Small Update / Patch Notes) is the real destination.
- Public Web API (`ISteamNews`) is **read** oriented; there is **no** reliable third-party “post patch notes as any linked Steam user” API for a SaaS.
- Product stance:
  1. **Dedicated Steam News format** (title + body tuned for paste into Steamworks).
  2. One-click **Copy for Steamworks** + short help link to Steam partner docs.
  3. Optional later: partner-only tooling if Valve opens publisher write APIs (do not block the roadmap on this).

---

## Data model (proposed)

Keep `patch_notes` as canonical markdown (+ legacy `social_post` for backward compatibility).

New tables (names indicative):

```text
platform_drafts
  id, patch_note_id, platform, body, title?,
  media_urls[], meta jsonb,   -- e.g. facebook feeling, thread mode
  updated_at

connected_accounts
  id, user_id, provider,   -- discord_webhook | discord_bot | x | meta_ig | ...
  label, external_id?,
  secrets (encrypted), scopes, expires_at, status

scheduled_posts
  id, patch_note_id, platform_draft_id, connection_id,
  scheduled_at, timezone, status (pending|sending|sent|failed|cancelled),
  external_post_id?, last_error?, sent_at?
```

Migrate: on first open of Share Studio, seed drafts from existing `social_post` into the platforms suggested by tone.

---

## Scheduling

- User picks datetime + timezone → row in `scheduled_posts`.
- Worker: Vercel Cron every minute (or every 5) processes due rows; retries with backoff; surfaces failures in UI.
- Cancel / reschedule before send.
- Same pipeline for Discord webhook now; other providers when connected.

---

## Media

- Upload to Vercel Blob (or equivalent); store public URLs for Meta/Discord attachments.
- Platform rules validate before publish (e.g. Instagram requires media; X image size limits).
- Phase 1: one image per draft. Later: carousel / video.

---

## Phased delivery

### P0 | Share Studio foundations ✅ (shipped v0.6)

**In production code** (run `supabase/platform_drafts.sql` on the Easy Patch Supabase project):

- Editable markdown after generate and in history
- Multi-platform draft generation (defaults by tone; all platforms selectable)
- Per-draft edit + regenerate one + **regenerate all** (no quota hit) + copy
- Discord webhook publish now
- Persist `platform_drafts`; keep `social_post` as primary social for history
- Pro team: shared history (read + copy drafts)

### P1 | Discord publish + schedule ✅ (v0.7)

- Webhook / bot connection in Settings
- Publish now + **schedule** from Share Studio (Discord tab)
- Cron worker `/api/cron/process-scheduled-posts` (every 5 min on Vercel)
- SQL: `supabase/scheduled_posts.sql`

### P2 | Discord bot

- Invite bot, channel mapping, slash helpers
- Same scheduler

### P3 | Steam News format polish

- Dedicated preset + copy helper (already partly in P0)

### P4 | Meta + LinkedIn + X publish (OAuth)

- Connections UI, App Review prep, Blob media
- Publish now then schedule
- Facebook extras (feeling/activity) only after Page publish works
- X: decide Easy Patch billed vs BYOK

### P5 | Brand voice memory

- Studio tone memory across regenerations (roadmap item), feeds Share Studio

---

## Pricing / gating (suggestion)

| Capability | Trial | Solo | Pro |
|------------|-------|------|-----|
| Platform drafts + copy | Yes (within gen quota) | Yes | Yes |
| Discord webhook publish | Limited | Yes | Yes |
| Schedule | No or 1 queued | Yes | Yes |
| Discord bot + multi-channel | No | No | Yes |
| Social OAuth publish (when live) | No | Yes | Yes |
| Team shared connections | No | No | Yes (with seats) |

Final numbers TBD with Stripe; do not block P0 on gating.

---

## Out of scope (for now)

- Auto-posting every GitHub Release without user review (separate roadmap: auto-generate on tag)
- TikTok / YouTube / Reddit native publish
- Guaranteed Steam API write
- Scraping personal Instagram/Facebook without official APIs

---

## Success metrics

- % of generations that open Share Studio
- Drafts edited before copy/publish
- Discord publishes succeeded / failed
- Scheduled posts sent on time
- Copy-to-clipboard by platform (proxy for demand before OAuth)

---

## Implementation notes for agents

- Read this file + `docs/product-roadmap.md` + `docs/copywriting.md` before coding.
- Follow existing GitLab OAuth connect patterns for new connections.
- English UI only; no dash punctuation in prose.
- Prefer Vercel-native pieces (Cron, Blob, serverless routes) over a always-on Discord gateway until the bot needs it.
