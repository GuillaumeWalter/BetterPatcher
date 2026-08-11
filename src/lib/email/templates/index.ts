import { BILLING } from "@/lib/billing/constants";
import { appUrl } from "@/lib/email/client";
import { ctaButton, emailLayout } from "@/lib/email/templates/layout";

export function welcomeEmail(name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Welcome to Easy Patch 👋",
    html: emailLayout({
      preheader: "Your account is ready — verify your card (€0) to start.",
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">Thanks for signing up. Easy Patch turns commit logs into polished release notes and social posts in seconds.</p>
        <p style="margin:0 0 12px;"><strong>Next step:</strong> verify your card (€0 today) to unlock <strong>${BILLING.TRIAL_GENERATIONS} free generations</strong>.</p>
        ${ctaButton("Activate my trial", appUrl("/onboarding"))}
        <p style="margin:20px 0 0;font-size:13px;color:#8a7f72;">No subscription starts until you choose Solo or Pro.</p>
      `,
    }),
  };
}

export function trialActivatedEmail(name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Your trial is active — 5 free generations",
    html: emailLayout({
      preheader: `${BILLING.TRIAL_GENERATIONS} patch notes on us.`,
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">Your card is verified (€0 charged). You now have <strong>${BILLING.TRIAL_GENERATIONS} free generations</strong>.</p>
        <p style="margin:0 0 12px;">Paste commits or import from GitHub / GitLab — pick a tone and go.</p>
        ${ctaButton("Generate a patch note", appUrl("/dashboard/generate"))}
      `,
    }),
  };
}

export function trialLowEmail(remaining: number, name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: `Only ${remaining} free generation left`,
    html: emailLayout({
      preheader: "Make it count — or upgrade anytime.",
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">You have <strong>${remaining} generation</strong> left on your free trial.</p>
        <p style="margin:0 0 12px;">When you're ready, Solo and Pro unlock monthly quotas, history, and Share Studio.</p>
        ${ctaButton("Open the generator", appUrl("/dashboard/generate"))}
      `,
    }),
  };
}

export function trialExhaustedEmail(
  soloPrice: string,
  proPrice: string,
  name?: string | null,
) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Trial ended — pick Solo or Pro",
    html: emailLayout({
      preheader: "Continue generating patch notes with a paid plan.",
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">You've used all <strong>${BILLING.TRIAL_GENERATIONS} trial generations</strong>. Upgrade to keep going:</p>
        <ul style="margin:12px 0;padding-left:20px;color:#5c534a;">
          <li><strong>Solo</strong> — ${soloPrice}, ${BILLING.SOLO_MONTHLY_GENERATIONS} gen/mo</li>
          <li><strong>Pro</strong> — ${proPrice}, ${BILLING.PRO_MONTHLY_GENERATIONS} gen/mo (team)</li>
        </ul>
        ${ctaButton("View plans", appUrl("/dashboard/billing"))}
      `,
    }),
  };
}

export function subscriptionConfirmedEmail(
  plan: "solo" | "pro",
  priceLabel: string,
  name?: string | null,
) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const planName = plan === "solo" ? "Solo" : "Pro";
  const limit =
    plan === "solo"
      ? BILLING.SOLO_MONTHLY_GENERATIONS
      : BILLING.PRO_MONTHLY_GENERATIONS;

  return {
    subject: `You're on Easy Patch ${planName}`,
    html: emailLayout({
      preheader: `${limit} generations per month — let's ship.`,
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">Your <strong>${planName}</strong> subscription is active (${priceLabel}).</p>
        <p style="margin:0 0 12px;">You get <strong>${limit} generations per month</strong>, full history, and Share Studio drafts.</p>
        ${ctaButton("Start generating", appUrl("/dashboard/generate"))}
      `,
    }),
  };
}

export function paymentFailedEmail(name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Action needed — payment failed",
    html: emailLayout({
      preheader: "Update your card to keep generating patch notes.",
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">We couldn't process your last payment. Your generations are paused until you update your card.</p>
        <p style="margin:0 0 12px;">It takes less than a minute in the Stripe portal.</p>
        ${ctaButton("Update payment method", appUrl("/dashboard/billing"))}
      `,
    }),
  };
}

export function subscriptionCanceledEmail(name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Your subscription was canceled",
    html: emailLayout({
      preheader: "We're sorry to see you go.",
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">Your Easy Patch subscription has been canceled. You keep access until the end of your billing period.</p>
        <p style="margin:0 0 12px;">Changed your mind? You can resubscribe anytime.</p>
        ${ctaButton("View plans", appUrl("/dashboard/billing"))}
      `,
    }),
  };
}

export function upgradeToProEmail(
  soloPrice: string,
  proPrice: string,
  name?: string | null,
) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Need more generations? Meet Pro",
    html: emailLayout({
      preheader: `${BILLING.PRO_MONTHLY_GENERATIONS} generations/month for teams.`,
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">You're on <strong>Solo</strong> (${soloPrice}). If you're hitting your monthly limit, <strong>Pro</strong> (${proPrice}) gives you:</p>
        <ul style="margin:12px 0;padding-left:20px;color:#5c534a;">
          <li>${BILLING.PRO_MONTHLY_GENERATIONS} generations / month</li>
          <li>Built for studios & live-ops teams</li>
          <li>Team seats (coming soon)</li>
        </ul>
        ${ctaButton("Upgrade to Pro", appUrl("/dashboard/billing"))}
      `,
    }),
  };
}

export function inactiveTrialReminderEmail(name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: "Your free generations are waiting",
    html: emailLayout({
      preheader: `You still have trial generations on Easy Patch.`,
      body: `
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1410;">${greeting}</p>
        <p style="margin:0 0 12px;">You activated your trial but haven't generated a patch note yet. Paste a commit log — we'll handle the rest.</p>
        ${ctaButton("Try it now", appUrl("/dashboard/generate"))}
      `,
    }),
  };
}
