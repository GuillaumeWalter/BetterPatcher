# Easy Patch | GitHub Action

Generate patch notes from **your repo CI** when you ship a tag or release. Uses the same quota as the in-app generator.

Two options:

| Method | When to use |
|--------|-------------|
| **GitHub Release webhook** | Settings → pick repo → GitHub sends `release published` |
| **GitHub Action** (this doc) | Tag push workflows, monorepos, or when you want commits from `git log` in CI |

---

## 1. Get credentials (2 min)

1. Sign in to [Easy Patch](https://easypatch.app) (or your Vercel URL)
2. Open **Dashboard → Settings → Integrations**
3. Copy:
   - **User ID** from the `Authorization` header (part before `:`)
   - **Token** (part after `:`)
4. In your **game/app repo** (not necessarily BetterPatcher):  
   **Settings → Secrets and variables → Actions** → New repository secrets:
   - `EASYPATCH_USER_ID`
   - `EASYPATCH_TOKEN`

The token is an HMAC of your user id (same as the release webhook URL). Treat it like a password.

---

## 2. Add the workflow (5 min)

Copy [examples/github-action-easypatch.yml](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/examples/github-action-easypatch.yml) into your repo as:

`.github/workflows/easypatch.yml`

Default triggers:

- `release` → `published`
- `push` → tags matching `v*`

Adjust `on:` to match your release process.

---

## 3. API reference

**Endpoint:** `POST https://YOUR-DOMAIN/api/action/generate`

**Auth header:**

```http
Authorization: EasyPatch YOUR_USER_ID:YOUR_TOKEN
```

**Body (JSON):**

```json
{
  "commits": "feat: ...\nfix: ...",
  "tone": "technical",
  "repoFullName": "owner/repo",
  "tag": "v1.2.0"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `commits` | Yes | Commit messages or changelog text |
| `tone` | No | `technical` · `marketing` · `gaming` (default: technical) |
| `repoFullName` | No | Shown in history |
| `tag` | No | Prepended to commits if missing |

**Success (200):**

```json
{
  "ok": true,
  "savedId": "…",
  "markdown": "…",
  "socialPost": "…",
  "generationsRemaining": 4,
  "historyUrl": "https://…/dashboard/history/…"
}
```

**Errors:** `401` bad token · `402` quota · `503` AI not configured

---

## 4. Verify

1. Run the workflow manually (**Actions → Easy Patch → Run workflow**) or publish a test release
2. Open **Easy Patch → History** — new patch note should appear
3. Open Share Studio to copy Discord / Steam drafts

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Re-copy secrets from Settings; no extra spaces |
| 402 Quota | Upgrade or wait for monthly reset |
| Empty commits | Check `git log` step in workflow |
| Workflow not running | Tag must match `v*` pattern or adjust `on:` |

---

## Related

- Release webhook (no Action): Settings → GitHub Release automation
- Discord schedule: Share Studio → Discord tab → Schedule
