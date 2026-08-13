import type { PaidPlanTier } from "@/lib/billing/constants";
import { BILLING } from "@/lib/billing/constants";

/** Presentment / subscription currency helpers. */

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "usd",
  CA: "usd",
  GB: "gbp",
  AU: "usd",
  NZ: "usd",
  JP: "jpy",
  KR: "krw",
  SG: "usd",
  HK: "usd",
  CH: "eur",
  // Eurozone
  AT: "eur",
  BE: "eur",
  CY: "eur",
  DE: "eur",
  EE: "eur",
  ES: "eur",
  FI: "eur",
  FR: "eur",
  GR: "eur",
  HR: "eur",
  IE: "eur",
  IT: "eur",
  LT: "eur",
  LU: "eur",
  LV: "eur",
  MT: "eur",
  NL: "eur",
  PT: "eur",
  SI: "eur",
  SK: "eur",
};

/** Currencies with dedicated Solo / Pro Stripe Prices (create in Dashboard). */
export const PAID_CURRENCIES = ["eur", "usd", "gbp", "jpy", "krw"] as const;
export type PaidCurrency = (typeof PAID_CURRENCIES)[number];

const DEFAULT_CURRENCY: PaidCurrency = "eur";

const MONTHLY_LABELS: Record<
  PaidCurrency,
  { solo: string; pro: string }
> = {
  eur: { solo: "€4.99 / month", pro: "€9.99 / month" },
  usd: { solo: "$4.99 / month", pro: "$9.99 / month" },
  gbp: { solo: "£4.99 / month", pro: "£9.99 / month" },
  jpy: { solo: "¥740 / month", pro: "¥1,480 / month" },
  krw: { solo: "₩6,900 / month", pro: "₩13,900 / month" },
};

/** Annual prices (~15% off vs 12× monthly). */
const ANNUAL_LABELS: Record<
  PaidCurrency,
  { solo: string; pro: string }
> = {
  eur: { solo: "€50.88 / year", pro: "€101.88 / year" },
  usd: { solo: "$50.88 / year", pro: "$101.88 / year" },
  gbp: { solo: "£50.88 / year", pro: "£101.88 / year" },
  jpy: { solo: "¥7,540 / year", pro: "¥15,080 / year" },
  krw: { solo: "₩70,300 / year", pro: "₩141,600 / year" },
};

export function isPaidCurrency(value: string): value is PaidCurrency {
  return (PAID_CURRENCIES as readonly string[]).includes(value);
}

export function getCountryFromHeaders(headers: Headers): string | null {
  const country =
    headers.get("x-vercel-ip-country")?.trim().toUpperCase() ||
    headers.get("cf-ipcountry")?.trim().toUpperCase() ||
    null;

  if (!country || country === "XX" || country === "T1") return null;
  return country;
}

/** Currency for Checkout (setup + subscribe). Unknown countries → EUR. */
export function resolveBillingCurrency(headers: Headers): PaidCurrency {
  const country = getCountryFromHeaders(headers);
  if (!country) return DEFAULT_CURRENCY;

  const mapped = COUNTRY_CURRENCY[country] ?? DEFAULT_CURRENCY;
  return isPaidCurrency(mapped) ? mapped : DEFAULT_CURRENCY;
}

/** @deprecated use resolveBillingCurrency */
export function resolveSetupCurrency(request: Request): string {
  return resolveBillingCurrency(request.headers);
}

export function priceLabelForCurrency(
  tier: PaidPlanTier,
  currency: PaidCurrency = DEFAULT_CURRENCY,
  interval: "monthly" | "annual" = "monthly",
): string {
  const labels = interval === "annual" ? ANNUAL_LABELS : MONTHLY_LABELS;
  return labels[currency][tier];
}

export function billingLabelsForCurrency(
  currency: PaidCurrency,
  interval: "monthly" | "annual" = "monthly",
) {
  return {
    currency,
    interval,
    soloPriceLabel: priceLabelForCurrency("solo", currency, interval),
    proPriceLabel: priceLabelForCurrency("pro", currency, interval),
    annualDiscountPercent: BILLING.ANNUAL_DISCOUNT_PERCENT,
  };
}

/** Amounts to create in Stripe Dashboard (reference for ops). */
export const STRIPE_PRICE_AMOUNTS = {
  eur: { solo: "4.99", pro: "9.99", zeroDecimal: false },
  usd: { solo: "4.99", pro: "9.99", zeroDecimal: false },
  gbp: { solo: "4.99", pro: "9.99", zeroDecimal: false },
  jpy: { solo: "740", pro: "1480", zeroDecimal: true },
  krw: { solo: "6900", pro: "13900", zeroDecimal: true },
} as const;

export const STRIPE_ANNUAL_PRICE_AMOUNTS = {
  eur: { solo: "50.88", pro: "101.88", zeroDecimal: false },
  usd: { solo: "50.88", pro: "101.88", zeroDecimal: false },
  gbp: { solo: "50.88", pro: "101.88", zeroDecimal: false },
  jpy: { solo: "7540", pro: "15080", zeroDecimal: true },
  krw: { solo: "70300", pro: "141600", zeroDecimal: true },
} as const;
