import type { PaidPlanTier } from "@/lib/billing/constants";
import {
  isPaidCurrency,
  type PaidCurrency,
  PAID_CURRENCIES,
} from "@/lib/billing/currency";

export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getAuthSecret(): string | undefined {
  return readEnv("AUTH_SECRET", "NEXTAUTH_SECRET");
}

export function getGitHubClientId(): string | undefined {
  return readEnv("AUTH_GITHUB_ID", "GITHUB_ID");
}

export function getGitHubClientSecret(): string | undefined {
  return readEnv("AUTH_GITHUB_SECRET", "GITHUB_SECRET");
}

export function getStripeSecretKey(): string | undefined {
  return readEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string | undefined {
  return readEnv("STRIPE_WEBHOOK_SECRET");
}

/** Default EUR Price (fallback). */
export function getStripeSoloPriceId(): string | undefined {
  return readEnv("STRIPE_SOLO_PRICE_ID");
}

export function getStripeProPriceId(): string | undefined {
  return readEnv("STRIPE_PRO_PRICE_ID");
}

function priceEnvKey(plan: PaidPlanTier, currency: PaidCurrency): string {
  if (currency === "eur") {
    return plan === "solo" ? "STRIPE_SOLO_PRICE_ID" : "STRIPE_PRO_PRICE_ID";
  }
  const prefix = plan === "solo" ? "STRIPE_SOLO_PRICE_ID" : "STRIPE_PRO_PRICE_ID";
  return `${prefix}_${currency.toUpperCase()}`;
}

/**
 * Resolve Stripe Price ID for plan + currency.
 * Falls back to EUR Price if the local currency env is missing.
 */
export function getStripePriceIdForCurrency(
  plan: PaidPlanTier,
  currency: string,
): { priceId: string | undefined; currency: PaidCurrency } {
  const paid: PaidCurrency = isPaidCurrency(currency) ? currency : "eur";

  if (paid !== "eur") {
    const localId = readEnv(priceEnvKey(plan, paid));
    if (localId) return { priceId: localId, currency: paid };
  }

  const eurId =
    plan === "solo" ? getStripeSoloPriceId() : getStripeProPriceId();
  return { priceId: eurId, currency: "eur" };
}

/** All configured Price IDs (for webhook plan_tier mapping). */
export function listConfiguredStripePriceIds(): {
  solo: string[];
  pro: string[];
} {
  const solo: string[] = [];
  const pro: string[] = [];

  for (const currency of PAID_CURRENCIES) {
    const soloId = readEnv(priceEnvKey("solo", currency));
    const proId = readEnv(priceEnvKey("pro", currency));
    if (soloId) solo.push(soloId);
    if (proId) pro.push(proId);
  }

  return { solo, pro };
}
