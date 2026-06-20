/** Limites produit — ajuster ici pour protéger les coûts IA. */
export const BILLING = {
  /** Générations offertes après vérif CB (0 €). */
  TRIAL_GENERATIONS: 5,
  /** Générations / mois sur abonnement Pro (~10 €). */
  PRO_MONTHLY_GENERATIONS: 60,
  /** Délai minimum entre deux générations (anti-spam). */
  MIN_SECONDS_BETWEEN_GENERATIONS: 20,
  /** Taille max du texte commits envoyé à l'IA. */
  MAX_COMMITS_CHARS: 15_000,
  /** Nombre max de lignes de commits. */
  MAX_COMMIT_LINES: 40,
  PRO_PRICE_LABEL: "10 € / mois",
} as const;

export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

export type UserPlan = "pending_setup" | "trial" | "pro" | "blocked";

export type UserBillingProfile = {
  userId: string;
  email: string | null;
  stripeCustomerId: string | null;
  paymentMethodVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
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

  const isPro = profile.subscriptionStatus === "active";

  if (isPro) {
    const limit = profile.periodGenerationsLimit || BILLING.PRO_MONTHLY_GENERATIONS;
    const used = profile.periodGenerationsUsed;
    const remaining = Math.max(0, limit - used);

    return {
      plan: "pro",
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
