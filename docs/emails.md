# Email templates — Easy Patch

All emails use **Resend** (`RESEND_API_KEY`). Without it, sends are silently skipped (app still works).

## Templates

| ID | Trigger | Subject |
|----|---------|---------|
| `welcome` | New GitHub signup | Welcome to Easy Patch 👋 |
| `trialActivated` | Stripe card verified (€0) | Your trial is active |
| `trialLow` | 1 trial generation left | Only 1 free generation left |
| `trialExhausted` | Last trial generation used | Trial ended — pick Solo or Pro |
| `subscriptionConfirmed` | Stripe subscription checkout | You're on Easy Patch Solo/Pro |
| `paymentFailed` | Stripe `past_due` | Action needed — payment failed |
| `subscriptionCanceled` | Stripe subscription deleted | Your subscription was canceled |
| `upgradeToPro` | Manual / future cron | Need more generations? Meet Pro |
| `inactiveTrialReminder` | Future cron (not wired yet) | Your free generations are waiting |

## Preview (dev only)

```bash
npm run dev
open http://localhost:3000/api/emails/preview?template=welcome
```

List all: `http://localhost:3000/api/emails/preview?template=invalid`

## Env vars

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Easy Patch <hello@yourdomain.com>
```

Verify your domain in Resend before production sends.

## Files

- `src/lib/email/client.ts` — Resend API
- `src/lib/email/templates/` — HTML templates
- `src/lib/email/index.ts` — send helpers + triggers
