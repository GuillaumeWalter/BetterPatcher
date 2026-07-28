/** Limites produit — ajuster ici pour protéger les coûts IA. */
export const BILLING = {
  /** Générations offertes après vérif CB (0 €). */
  TRIAL_GENERATIONS: 5,
  /** Générations / mois — plan Solo (1 utilisateur). */
  SOLO_MONTHLY_GENERATIONS: 25,
  /** Générations / mois — plan Pro (équipe). */
  PRO_MONTHLY_GENERATIONS: 80,
  /** Délai minimum entre deux générations (anti-spam). */
  MIN_SECONDS_BETWEEN_GENERATIONS: 20,
  /** Taille max du texte commits envoyé à l'IA. */
  MAX_COMMITS_CHARS: 15_000,
  /** Nombre max de lignes de commits. */
  MAX_COMMIT_LINES: 40,
  SOLO_PRICE_LABEL: "4,99 € / mois",
  PRO_PRICE_LABEL: "9,99 € / mois",
} as const;

export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

/** Tier Stripe / abonnement payant (hors essai). */
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
