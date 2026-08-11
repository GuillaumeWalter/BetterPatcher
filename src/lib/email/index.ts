import { BILLING, priceLabelForTier } from "@/lib/billing/constants";
import { sendEmail } from "@/lib/email/client";
import {
  inactiveTrialReminderEmail,
  paymentFailedEmail,
  subscriptionCanceledEmail,
  subscriptionConfirmedEmail,
  trialActivatedEmail,
  trialExhaustedEmail,
  trialLowEmail,
  upgradeToProEmail,
  welcomeEmail,
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

export async function sendUpgradeToProEmail(ctx: UserEmailContext) {
  const { subject, html } = upgradeToProEmail(
    BILLING.SOLO_PRICE_LABEL,
    BILLING.PRO_PRICE_LABEL,
    ctx.name,
  );
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "upgrade-pro-offer"),
  });
}

export async function sendInactiveTrialReminderEmail(ctx: UserEmailContext) {
  const { subject, html } = inactiveTrialReminderEmail(ctx.name);
  return sendEmail({
    to: ctx.email,
    subject,
    html,
    idempotencyKey: idempotencyKey(ctx.userId, "inactive-trial"),
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

export { isEmailConfigured } from "@/lib/email/client";
