# Linear ticket enrichment — setup

Easy Patch can fetch **Linear issue titles** when commit messages contain keys like `ENG-42`, then weave them into patch notes. **Solo + Pro** only.

---

## 1. Create a Linear OAuth app (5 min)

1. [Linear → Settings → API → OAuth applications](https://linear.app/settings/api)
2. **New OAuth application**
3. **Callback URL:** `https://TON-DOMAINE/api/linear/callback`
4. Scopes: **read**
5. Copy **Client ID** → Vercel: `AUTH_LINEAR_ID`
6. Copy **Client secret** → Vercel: `AUTH_LINEAR_SECRET`

## 2. Supabase SQL

Run [supabase/linear_token.sql](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/linear_token.sql)

## 3. User flow

1. Subscribe to **Solo or Pro**
2. Generator → paste commits with ticket keys (e.g. `GAME-101: fix crash`)
3. **Connect Linear** (button appears when keys are detected)
4. Generate — titles are fetched automatically

## 4. Jira

Not wired yet. Keys like `PROJ-123` are parsed but only **Linear** titles are fetched in v0.5. Jira Cloud OAuth can follow the same pattern.

---

## Env vars (Vercel)

| Variable | Required |
|----------|----------|
| `AUTH_LINEAR_ID` | Yes |
| `AUTH_LINEAR_SECRET` | Yes |

Callback: `https://TON-DOMAINE/api/linear/callback`
