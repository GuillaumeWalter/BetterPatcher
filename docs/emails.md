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
| `upgradeToPro` | Solo plan ≥ 80% monthly quota used | Need more generations? Meet Pro |
| `soloQuotaLow` | Solo plan ≤ 5 generations left (< 80% used) | N Solo generations left this month |
| `soloQuotaExhausted` | Last Solo generation of the month | Monthly Solo quota reached |
| `inactiveTrialReminder` | Daily cron (3+ days, no generation) | Your free generations are waiting |
| `waitlistConfirmation` | Waitlist signup | You're on the Easy Patch waitlist |

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
CRON_SECRET=random-long-secret   # Vercel cron auth
```

Verify your domain in Resend before production sends.

## Cron (Vercel)

`vercel.json` runs `/api/cron/inactive-trial-reminder` daily at 10:00 UTC.

1. Add `CRON_SECRET` on Vercel (any long random string)
2. Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on cron hits

## Files

- `src/lib/email/client.ts` — Resend API
- `src/lib/email/templates/` — HTML templates
- `src/lib/email/index.ts` — send helpers + triggers
- `src/app/api/cron/inactive-trial-reminder/route.ts` — inactive trial cron
