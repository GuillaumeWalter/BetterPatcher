/** Product limits: tune here to protect AI cost. */
export const BILLING = {
  /** Generations after card check (€0). */
  TRIAL_GENERATIONS: 5,
  /** Generations / month on Solo (1 user). */
  SOLO_MONTHLY_GENERATIONS: 25,
  /** Generations / month on Pro (team). */
  PRO_MONTHLY_GENERATIONS: 80,
  /** Minimum seconds between generations. */
  MIN_SECONDS_BETWEEN_GENERATIONS: 20,
  /** Max commit text sent to the model. */
  MAX_COMMITS_CHARS: 15_000,
  /** Max commit lines. */
  MAX_COMMIT_LINES: 40,
  /** Max style-reference patch note characters. */
  MAX_REFERENCE_CHARS: 12_000,
  SOLO_PRICE_LABEL: "€4.99 / month",
  PRO_PRICE_LABEL: "€9.99 / month",
  /** Annual billing discount (shown on pricing). */
  ANNUAL_DISCOUNT_PERCENT: 15,
  /** Max seats on Pro (owner + invites). */
  PRO_MAX_TEAM_SEATS: 5,
  /** Max pending Discord schedules on trial. */
  SCHEDULE_MAX_PENDING_TRIAL: 1,
  /** Max pending Discord schedules on Solo / Pro. */
  SCHEDULE_MAX_PENDING_PAID: 20,
} as const;

export type BillingInterval = "monthly" | "annual";

export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

/** Paid Stripe tier (outside trial). */
export type PaidPlanTier = "solo" | "pro";

export type PlanTier = "none" | PaidPlanTier;

export type UserPlan =
  | "pending_setup"
  | "trial"
  | "solo"
  | "pro"
  | "blocked";

export type UserBillingProfile = {
  userId: string;
  email: string | null;
  stripeCustomerId: string | null;
  paymentMethodVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  planTier: PlanTier;
  trialGenerationsUsed: number;
  trialGenerationsLimit: number;
  periodGenerationsUsed: number;
  periodGenerationsLimit: number;
  billingPeriodStart: string | null;
  lastGenerationAt: string | null;
  githubAccessToken: string | null;
  releaseAutoRepo: string | null;
  discordWebhookUrl: string | null;
  workspaceOwnerId: string | null;
  favoriteRepos: string[];
  discordGuildId: string | null;
  discordChannelId: string | null;
};

export type QuotaSnapshot = {
  plan: UserPlan;
  paymentMethodVerified: boolean;
  generationsUsed: number;
  generationsLimit: number;
  generationsRemaining: number;
  requiresSubscription: boolean;
  requiresSetup: boolean;
  canGenerate: boolean;
  minSecondsBetweenGenerations: number;
  /** Set when the user is on a Pro team (not the billing owner). */
  teamOwnerId?: string | null;
};

export function monthlyGenerationsForTier(tier: PaidPlanTier): number {
  return tier === "solo"
    ? BILLING.SOLO_MONTHLY_GENERATIONS
    : BILLING.PRO_MONTHLY_GENERATIONS;
}

/** Default EUR labels. Prefer priceLabelForCurrency from currency.ts when geo is known. */
export function priceLabelForTier(tier: PaidPlanTier): string {
  return tier === "solo" ? BILLING.SOLO_PRICE_LABEL : BILLING.PRO_PRICE_LABEL;
}

export function isPaidPlan(plan: string | undefined): boolean {
  return plan === "solo" || plan === "pro";
}

export function buildQuotaSnapshot(
  profile: UserBillingProfile,
  options?: { teamOwnerId?: string | null },
): QuotaSnapshot {
  const teamOwnerId = options?.teamOwnerId ?? null;
  const requiresSetup = !profile.paymentMethodVerified && !teamOwnerId;

  if (requiresSetup) {
    return {
      plan: "pending_setup",
      paymentMethodVerified: false,
      generationsUsed: 0,
      generationsLimit: BILLING.TRIAL_GENERATIONS,
      generationsRemaining: 0,
      requiresSubscription: false,
      requiresSetup: true,
      canGenerate: false,
      minSecondsBetweenGenerations: BILLING.MIN_SECONDS_BETWEEN_GENERATIONS,
      teamOwnerId,
    };
  }

  if (profile.subscriptionStatus === "past_due") {
    const tier: PaidPlanTier =
      profile.planTier === "solo" || profile.planTier === "pro"
        ? profile.planTier
        : "pro";
    return {
      plan: tier,
      paymentMethodVerified: true,
      generationsUsed: profile.periodGenerationsUsed,
      generationsLimit:
        profile.periodGenerationsLimit || monthlyGenerationsForTier(tier),
      generationsRemaining: 0,
      requiresSubscription: true,
      requiresSetup: false,
      canGenerate: false,
      minSecondsBetweenGenerations: BILLING.MIN_SECONDS_BETWEEN_GENERATIONS,
      teamOwnerId,
    };
  }

  const isSubscribed = profile.subscriptionStatus === "active";

  if (isSubscribed) {
    const tier: PaidPlanTier =
      profile.planTier === "solo" || profile.planTier === "pro"
        ? profile.planTier
        : "pro";
    const defaultLimit = monthlyGenerationsForTier(tier);
    const limit = profile.periodGenerationsLimit || defaultLimit;
    const used = profile.periodGenerationsUsed;
    const remaining = Math.max(0, limit - used);

    return {
      plan: tier,
      paymentMethodVerified: true,
      generationsUsed: used,
      generationsLimit: limit,
      generationsRemaining: remaining,
      requiresSubscription: false,
      requiresSetup: false,
      canGenerate: remaining > 0,
      minSecondsBetweenGenerations: BILLING.MIN_SECONDS_BETWEEN_GENERATIONS,
      teamOwnerId,
    };
  }

  const used = profile.trialGenerationsUsed;
  const limit = profile.trialGenerationsLimit;
  const remaining = Math.max(0, limit - used);
  const trialExhausted = remaining === 0;

  return {
    plan: trialExhausted ? "blocked" : "trial",
    paymentMethodVerified: true,
    generationsUsed: used,
    generationsLimit: limit,
    generationsRemaining: remaining,
    requiresSubscription: trialExhausted,
    requiresSetup: false,
    canGenerate: !trialExhausted,
    minSecondsBetweenGenerations: BILLING.MIN_SECONDS_BETWEEN_GENERATIONS,
    teamOwnerId,
  };
}
