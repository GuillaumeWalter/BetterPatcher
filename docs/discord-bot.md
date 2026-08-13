# Discord bot — setup (Easy Patch)

Easy Patch can post to Discord via **bot** (recommended) or **incoming webhook** (fallback).

The bot code is in the repo. **You** must create the Discord application (Discord does not allow third parties to create apps on your behalf).

---

## 1. Create the Discord app (5 min)

1. Open [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → name it `Easy Patch`
2. **Bot** tab → **Reset Token** → copy → Vercel env: `DISCORD_BOT_TOKEN`
3. **General Information** → copy **Application ID** → `DISCORD_APPLICATION_ID`
4. Copy **Public Key** → `DISCORD_PUBLIC_KEY`
5. **Bot** tab → enable **Message Content Intent** (optional, slash commands work without it)

## 2. Interactions endpoint (2 min)

1. **General Information** → **Interactions Endpoint URL**:
   ```
   https://TON-DOMAINE/api/discord/interactions
   ```
2. Discord will send a PING — Vercel must be deployed with the env vars above first.

## 3. Register slash commands (1 min)

On your machine (or any terminal with env vars):

```bash
DISCORD_BOT_TOKEN=xxx DISCORD_APPLICATION_ID=yyy npm run discord:register-commands
```

Commands available:
- `/easypatch link <code>` — link channel to your account
- `/easypatch status` — bot health check

## 4. Supabase SQL

Run [supabase/discord_bot.sql](https://github.com/GuillaumeWalter/BetterPatcher/blob/master/supabase/discord_bot.sql) in SQL Editor.

## 5. Link a channel in the app

1. [Easy Patch → Settings](https://TON-DOMAINE/dashboard/settings)
2. **Discord bot** → **Invite bot to server**
3. **Generate link code**
4. In Discord, in the target channel: `/easypatch link ABCD12` (your code)
5. Share Studio → **Post to Discord** uses the linked channel

---

## Env vars (Vercel)

| Variable | Required |
|----------|----------|
| `DISCORD_BOT_TOKEN` | Yes |
| `DISCORD_APPLICATION_ID` | Yes |
| `DISCORD_PUBLIC_KEY` | Yes (signature verification) |

---

## Webhook fallback

If the bot is not configured, users can still paste an [incoming webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) in Settings.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Interactions URL fails verification | Deploy with `DISCORD_PUBLIC_KEY` set |
| `/easypatch` not found | Run `npm run discord:register-commands` |
| Post fails | Re-link channel; check bot has **Send Messages** in that channel |
| Code expired | Generate a new code (15 min TTL) |
