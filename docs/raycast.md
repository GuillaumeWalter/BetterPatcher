# Easy Patch | Raycast

Generate patch notes from **any pasted commit log** without opening the browser. Ideal when you are not on GitHub (Perforce, Plastic, SVN, or a copied `git log`).

## Setup (macOS + Raycast)

1. Install [Raycast](https://www.raycast.com/)
2. From this repo:

```bash
cd extensions/raycast-easypatch
npm install
npm run dev
```

3. In Raycast preferences for **Easy Patch**, set:
   - **User ID** and **Token** from App → Settings → Integrations (`EasyPatch USER_ID:TOKEN`)
   - Optional API base URL (default `https://easypatch.app`)
   - Default tone

## Commands

| Command | What it does |
|---------|----------------|
| **Generate Patch Note from Clipboard** | Uses clipboard text as the commit log |
| **Generate Patch Note from Text** | Paste any log in a form, then generate |

Both call `POST /api/action/generate` (same auth as the CLI and GitHub Action) and count against your Solo / Pro / Trial quota.

## Tips

- Copy a Perforce / Plastic changelist description, then run the clipboard command
- After generate, copy Markdown or open History in Easy Patch
- For CI / tags, prefer the [GitHub Action](github-action.md) or [CLI](cli.md)

## Related

- CLI: [`docs/cli.md`](cli.md)
- Integration credentials: App → Settings → Integrations
