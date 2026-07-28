/** Presentment currency for Stripe Checkout setup mode (card verify). */

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "usd",
  CA: "cad",
  GB: "gbp",
  AU: "aud",
  NZ: "nzd",
  JP: "jpy",
  CH: "chf",
  NO: "nok",
  SE: "sek",
  DK: "dkk",
  PL: "pln",
  CZ: "czk",
  HU: "huf",
  RO: "ron",
  BG: "bgn",
  TR: "try",
  BR: "brl",
  MX: "mxn",
  AR: "ars",
  CL: "clp",
  CO: "cop",
  IN: "inr",
  SG: "sgd",
  HK: "hkd",
  KR: "krw",
  TW: "twd",
  AE: "aed",
  SA: "sar",
  IL: "ils",
  ZA: "zar",
  // Eurozone + nearby defaulting to EUR
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

const DEFAULT_CURRENCY = "eur";

/**
 * Resolve ISO currency for Setup Checkout from request geo headers.
 * Subscriptions stay on EUR Price IDs; this only affects card verification UX.
 */
export function resolveSetupCurrency(request: Request): string {
  const country =
    request.headers.get("x-vercel-ip-country")?.trim().toUpperCase() ||
    request.headers.get("cf-ipcountry")?.trim().toUpperCase() ||
    null;

  if (!country || country === "XX" || country === "T1") {
    return DEFAULT_CURRENCY;
  }

  return COUNTRY_CURRENCY[country] ?? DEFAULT_CURRENCY;
}
