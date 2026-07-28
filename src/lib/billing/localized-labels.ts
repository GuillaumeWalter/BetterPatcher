import { headers } from "next/headers";

import {
  billingLabelsForCurrency,
  resolveBillingCurrency,
} from "@/lib/billing/currency";

/** Server-only: localized Solo / Pro labels from visitor country. */
export async function getLocalizedBillingLabels() {
  const h = await headers();
  const currency = resolveBillingCurrency(h);
  return billingLabelsForCurrency(currency);
}
