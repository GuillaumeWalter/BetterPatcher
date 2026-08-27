# Easy Patch CLI

Generate Markdown patch notes from **any** commit log (paste, pipe, or file). No GitHub required.

Uses the same API and quota as the web app and GitHub Action.

## Install

From this repo:

```bash
cd cli
npm link
```

Or run without installing:

```bash
node cli/bin/easypatch.mjs generate -f commits.txt
```

## Credentials

1. Sign in to Easy Patch → **App → Settings → Integrations**
2. Copy **User ID** and **Token** from the Authorization header (`EasyPatch USER_ID:TOKEN`)
3. Export:

```bash
export EASYPATCH_USER_ID=…
export EASYPATCH_TOKEN=…
# Optional (defaults to https://easypatch.app)
export EASYPATCH_URL=https://easypatch.app
```

## Usage

```bash
# Pipe git log (or any forge)
git log --pretty=%s -30 | easypatch generate

# File (Perforce / Plastic / SVN export, etc.)
easypatch generate -f commits.txt --tone gaming -o PATCH.md

# Full JSON (markdown + socialPost + historyUrl)
easypatch generate -f commits.txt --json
```

| Flag | Meaning |
|------|---------|
| `-f, --file` | Read commits from a file (default: stdin) |
| `-t, --tone` | `technical` · `marketing` · `gaming` |
| `-o, --out` | Write markdown to a file |
| `--repo` | Optional label for history |
| `--tag` | Optional release tag |
| `--json` | Print full API response |
| `--url` | Override API base URL |

## Related

- GitHub Action: [`docs/github-action.md`](github-action.md)
- Raycast: [`docs/raycast.md`](raycast.md)
