import { BILLING, priceLabelForTier } from "@/lib/billing/constants";
import { sendEmail } from "@/lib/email/client";
import {
  inactiveTrialReminderEmail,
  paymentFailedEmail,
  proQuotaExhaustedEmail,
  proQuotaLowEmail,
  soloQuotaExhaustedEmail,
  soloQuotaLowEmail,
  subscriptionCanceledEmail,
  subscriptionConfirmedEmail,
  trialActivatedEmail,
  trialExhaustedEmail,
  trialLowEmail,
  upgradeToProEmail,
  waitlistConfirmationEmail,
  welcomeEmail,
  teamInviteEmail,
} from "@/lib/email/templates";

type UserEmailContext = {
  userId: string;
  email: string;
  name?: string | null;
};

function idempotencyKey(userId: string, event: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${userId}-${event}-${day}`;
}

function periodIdempotencyKey(
  userId: string,
  event: string,
  billingPeriodStart?: string | null,
) {
  const period = billingPeriodStart?.slice(0, 10) ?? "unknown";
  return `${userId}-${event}-${period}`;
}

function weekIdempotencyKey(userId: string, event: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((now.getTime() - start.getTime()) / 86_400_000 + start.getUTCDay() + 1) /
      7,
  );
  return `${userId}-${event}-${year}-w${week}`;
}

export async function sendWelcomeEmail(input: {
  to: string;
  name?: string | null;
  userId?: string;
}) {
  const { subject, html } = welcomeEmail(input.name);
  return sendEmail({
    to: input.to,
    subject,
    html,
    idempotencyKey: input.userId
      ? idempotencyKey(input.userId, "welcome")
      : undefined,
  });
}

export async function sendTrialActivatedEmail(ctx: UserEmailContext) {
  const { subject, html } = trialActivatedEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "trial-activated"),
  });
}

export async function sendTrialLowEmail(
  ctx: UserEmailContext,
  remaining: number,
) {
  const { subject, html } = trialLowEmail(remaining, ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, `trial-low-${remaining}`),
  });
}

export async function sendTrialExhaustedEmail(ctx: UserEmailContext) {
  const { subject, html } = trialExhaustedEmail(
    BILLING.SOLO_PRICE_LABEL,
    BILLING.PRO_PRICE_LABEL,
    ctx.name,
  );
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "trial-exhausted"),
  });
}

export async function sendSubscriptionConfirmedEmail(
  ctx: UserEmailContext,
  plan: "solo" | "pro",
) {
  const { subject, html } = subscriptionConfirmedEmail(
    plan,
    priceLabelForTier(plan),
    ctx.name,
  );
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, `sub-${plan}`),
  });
}

export async function sendPaymentFailedEmail(ctx: UserEmailContext) {
  const { subject, html } = paymentFailedEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "payment-failed"),
  });
}

export async function sendSubscriptionCanceledEmail(ctx: UserEmailContext) {
  const { subject, html } = subscriptionCanceledEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "sub-canceled"),
  });
}

export async function sendUpgradeToProEmail(
  ctx: UserEmailContext,
  billingPeriodStart?: string | null,
) {
  const { subject, html } = upgradeToProEmail(
    BILLING.SOLO_PRICE_LABEL,
    BILLING.PRO_PRICE_LABEL,
    ctx.name,
  );
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: periodIdempotencyKey(
      ctx.userId,
      "upgrade-pro-offer",
      billingPeriodStart,
    ),
  });
}

export async function sendInactiveTrialReminderEmail(ctx: UserEmailContext) {
  const { subject, html } = inactiveTrialReminderEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: weekIdempotencyKey(ctx.userId, "inactive-trial"),
  });
}

export async function sendSoloQuotaLowEmail(
  ctx: UserEmailContext,
  remaining: number,
  limit: number,
  billingPeriodStart?: string | null,
) {
  const { subject, html } = soloQuotaLowEmail(remaining, limit, ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: periodIdempotencyKey(
      ctx.userId,
      `solo-quota-low-${remaining}`,
      billingPeriodStart,
    ),
  });
}

export async function sendSoloQuotaExhaustedEmail(
  ctx: UserEmailContext,
  billingPeriodStart?: string | null,
) {
  const { subject, html } = soloQuotaExhaustedEmail(
    BILLING.PRO_PRICE_LABEL,
    ctx.name,
  );
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: periodIdempotencyKey(
      ctx.userId,
      "solo-quota-exhausted",
      billingPeriodStart,
    ),
  });
}

export async function sendProQuotaLowEmail(
  ctx: UserEmailContext,
  remaining: number,
  limit: number,
  billingPeriodStart?: string | null,
) {
  const { subject, html } = proQuotaLowEmail(remaining, limit, ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: periodIdempotencyKey(
      ctx.userId,
      `pro-quota-low-${remaining}`,
      billingPeriodStart,
    ),
  });
}

export async function sendProQuotaExhaustedEmail(
  ctx: UserEmailContext,
  billingPeriodStart?: string | null,
) {
  const { subject, html } = proQuotaExhaustedEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: periodIdempotencyKey(
      ctx.userId,
      "pro-quota-exhausted",
      billingPeriodStart,
    ),
  });
}

export async function sendWaitlistConfirmationEmail(to: string) {
  const { subject, html } = waitlistConfirmationEmail();
  return sendEmail({
    to,
    subject,
    html,
    idempotencyKey: `waitlist-${to}`,
  });
}

export async function sendTeamInviteEmail(input: {
  to: string;
  ownerEmail: string;
  ownerUserId: string;
}) {
  const { subject, html } = teamInviteEmail({
    ownerEmail: input.ownerEmail,
    inviteeEmail: input.to,
  });
  return sendEmail({
    to: input.to,
    subject,
    html,
    idempotencyKey: `${input.ownerUserId}-team-invite-${input.to}`,
  });
}

/** After a successful generation — trial lifecycle emails. */
export async function maybeSendTrialLifecycleEmails(input: {
  userId: string;
  email: string | null | undefined;
  name?: string | null;
  plan: string;
  generationsRemaining: number;
}) {
  if (!input.email || input.plan !== "trial") return;

  const ctx: UserEmailContext = {
    userId: input.userId,
    email: input.email,
    name: input.name,
  };

  if (input.generationsRemaining === 1) {
    await sendTrialLowEmail(ctx, 1);
  } else if (input.generationsRemaining === 0) {
    await sendTrialExhaustedEmail(ctx);
  }
}

const SOLO_UPGRADE_THRESHOLD = 0.8;
const SOLO_QUOTA_LOW_REMAINING = 5;
const PRO_QUOTA_LOW_REMAINING = 10;

/** After a successful generation — Solo / Pro paid plan lifecycle emails. */
export async function maybeSendPaidPlanLifecycleEmails(input: {
  userId: string;
  email: string | null | undefined;
  name?: string | null;
  plan: string;
  generationsUsed: number;
  generationsLimit: number;
  generationsRemaining: number;
  billingPeriodStart?: string | null;
}) {
  if (!input.email || input.generationsLimit <= 0) return;
  if (input.plan !== "solo" && input.plan !== "pro") return;

  const ctx: UserEmailContext = {
    userId: input.userId,
    email: input.email,
    name: input.name,
  };

  if (input.plan === "solo") {
    const usageRatio = input.generationsUsed / input.generationsLimit;

    if (
      input.generationsRemaining > 0 &&
      usageRatio >= SOLO_UPGRADE_THRESHOLD
    ) {
      await sendUpgradeToProEmail(ctx, input.billingPeriodStart);
    }

    if (
      input.generationsRemaining > 0 &&
      input.generationsRemaining <= SOLO_QUOTA_LOW_REMAINING &&
      usageRatio < SOLO_UPGRADE_THRESHOLD
    ) {
      await sendSoloQuotaLowEmail(
        ctx,
        input.generationsRemaining,
        input.generationsLimit,
        input.billingPeriodStart,
      );
    }

    if (input.generationsRemaining === 0) {
      await sendSoloQuotaExhaustedEmail(ctx, input.billingPeriodStart);
    }
    return;
  }

  if (
    input.generationsRemaining > 0 &&
    input.generationsRemaining <= PRO_QUOTA_LOW_REMAINING
  ) {
    await sendProQuotaLowEmail(
      ctx,
      input.generationsRemaining,
      input.generationsLimit,
      input.billingPeriodStart,
    );
  }

  if (input.generationsRemaining === 0) {
    await sendProQuotaExhaustedEmail(ctx, input.billingPeriodStart);
  }
}

export { isEmailConfigured } from "@/lib/email/client";
