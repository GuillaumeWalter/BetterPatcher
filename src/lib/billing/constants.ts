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
} as const;

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
): QuotaSnapshot {
  const requiresSetup = !profile.paymentMethodVerified;

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
  };
}
