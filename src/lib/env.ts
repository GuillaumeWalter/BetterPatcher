import type { PaidPlanTier, BillingInterval } from "@/lib/billing/constants";
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

function priceEnvKey(
  plan: PaidPlanTier,
  currency: PaidCurrency,
  interval: BillingInterval,
): string {
  const planPart = plan === "solo" ? "STRIPE_SOLO" : "STRIPE_PRO";
  const intervalPart = interval === "annual" ? "_ANNUAL" : "";
  if (currency === "eur") {
    return `${planPart}${intervalPart}_PRICE_ID`;
  }
  return `${planPart}${intervalPart}_PRICE_ID_${currency.toUpperCase()}`;
}

/**
 * Resolve Stripe Price ID for plan + currency + interval.
 * Falls back to EUR Price if the local currency env is missing.
 * Annual falls back to monthly if annual price is not configured.
 */
export function getStripePriceIdForCurrency(
  plan: PaidPlanTier,
  currency: string,
  interval: BillingInterval = "monthly",
): { priceId: string | undefined; currency: PaidCurrency; interval: BillingInterval } {
  const paid: PaidCurrency = isPaidCurrency(currency) ? currency : "eur";

  const tryResolve = (
    cur: PaidCurrency,
    int: BillingInterval,
  ): string | undefined => readEnv(priceEnvKey(plan, cur, int));

  if (paid !== "eur") {
    const localId = tryResolve(paid, interval);
    if (localId) return { priceId: localId, currency: paid, interval };
  }

  const eurId = tryResolve("eur", interval);
  if (eurId) return { priceId: eurId, currency: "eur", interval };

  if (interval === "annual") {
    return getStripePriceIdForCurrency(plan, currency, "monthly");
  }

  const fallbackId =
    plan === "solo" ? getStripeSoloPriceId() : getStripeProPriceId();
  return { priceId: fallbackId, currency: "eur", interval: "monthly" };
}

/** All configured Price IDs (for webhook plan_tier mapping). */
export function listConfiguredStripePriceIds(): {
  solo: string[];
  pro: string[];
} {
  const solo: string[] = [];
  const pro: string[] = [];
  const intervals: BillingInterval[] = ["monthly", "annual"];

  for (const currency of PAID_CURRENCIES) {
    for (const interval of intervals) {
      const soloId = readEnv(priceEnvKey("solo", currency, interval));
      const proId = readEnv(priceEnvKey("pro", currency, interval));
      if (soloId) solo.push(soloId);
      if (proId) pro.push(proId);
    }
  }

  return { solo, pro };
}

export function getSentryDsn(): string | undefined {
  return readEnv("SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN");
}

export function getDiscordBotToken(): string | undefined {
  return readEnv("DISCORD_BOT_TOKEN");
}

export function getDiscordApplicationId(): string | undefined {
  return readEnv("DISCORD_APPLICATION_ID");
}

export function getDiscordPublicKey(): string | undefined {
  return readEnv("DISCORD_PUBLIC_KEY");
}
