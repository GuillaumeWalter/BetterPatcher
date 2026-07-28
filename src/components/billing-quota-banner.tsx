"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Sparkles } from "lucide-react";

import { BILLING } from "@/lib/billing/constants";
import type { QuotaSnapshot } from "@/lib/billing/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function planLabel(plan: QuotaSnapshot["plan"]) {
  switch (plan) {
    case "pro":
      return "Pro";
    case "solo":
      return "Solo";
    case "trial":
      return "Trial";
    case "blocked":
      return "Trial ended";
    default:
      return "Activation required";
  }
}

type BillingPayload = QuotaSnapshot & {
  soloPriceLabel?: string;
  proPriceLabel?: string;
};

export function BillingQuotaBanner() {
  const [quota, setQuota] = useState<BillingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/billing", { credentials: "same-origin" });
        if (response.ok) {
          setQuota((await response.json()) as BillingPayload);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading || !quota) return null;

  const soloLabel = quota.soloPriceLabel ?? BILLING.SOLO_PRICE_LABEL;
  const proLabel = quota.proPriceLabel ?? BILLING.PRO_PRICE_LABEL;

  return (
    <div className="surface-card gradient-border mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{planLabel(quota.plan)}</Badge>
          {quota.paymentMethodVerified ? (
            <span className="text-sm text-muted-foreground">
              {quota.generationsRemaining} / {quota.generationsLimit} left
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Card required (no charge today)
            </span>
          )}
        </div>
        {quota.requiresSetup ? (
          <p className="text-sm text-muted-foreground">
            Verify your card to unlock {BILLING.TRIAL_GENERATIONS} free
            generations (abuse prevention).
          </p>
        ) : quota.requiresSubscription ? (
          <p className="text-sm text-muted-foreground">
            Solo ({soloLabel}, {BILLING.SOLO_MONTHLY_GENERATIONS}/mo)
            or Pro ({proLabel}, {BILLING.PRO_MONTHLY_GENERATIONS}/mo
            | team).
          </p>
        ) : null}
      </div>


      <div className="flex flex-wrap gap-2">
        {quota.requiresSetup ? (
          <Button asChild size="sm">
            <Link href="/onboarding">
              <CreditCard />
              Activate trial
            </Link>
          </Button>
        ) : null}
        {quota.requiresSubscription ? (
          <Button asChild size="sm">
            <Link href="/dashboard/billing">
              <Sparkles />
              View plans
            </Link>
          </Button>
        ) : null}
        {quota.plan === "solo" ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/billing">
              <Sparkles />
              Upgrade to Pro
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function useBillingQuota() {
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null);

  async function refresh() {
    const response = await fetch("/api/billing", { credentials: "same-origin" });
    if (response.ok) {
      setQuota((await response.json()) as QuotaSnapshot);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { quota, refreshQuota: refresh };
}
