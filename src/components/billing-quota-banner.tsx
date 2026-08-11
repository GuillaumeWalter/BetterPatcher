"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, RefreshCw, Sparkles } from "lucide-react";

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
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(false);
      try {
        const response = await fetch("/api/billing", { credentials: "same-origin" });
        if (cancelled) return;
        if (response.ok) {
          setQuota((await response.json()) as BillingPayload);
        } else {
          setQuota(null);
          setLoadError(true);
        }
      } catch {
        if (!cancelled) {
          setQuota(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function retry() {
    setReloadKey((value) => value + 1);
  }

  if (isLoading) {
    return (
      <div
        className="surface-card gradient-border mb-6 h-20 animate-pulse rounded-2xl"
        aria-hidden
      />
    );
  }

  if (loadError || !quota) {
    return (
      <div
        className="surface-card gradient-border mb-6 flex flex-col gap-3 rounded-2xl border-destructive/20 p-4 sm:flex-row sm:items-center sm:justify-between"
        role="alert"
      >
        <div className="flex items-start gap-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>Could not load your billing quota. Generations may still work.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={retry}>
          <RefreshCw />
          Retry
        </Button>
      </div>
    );
  }

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
            {quota.canGenerate === false &&
            quota.paymentMethodVerified &&
            quota.generationsRemaining === 0 &&
            quota.plan !== "blocked" ? (
              <>
                {" "}
                <span className="text-destructive">
                  Payment issue — update your card in the billing portal.
                </span>
              </>
            ) : null}
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
        {quota.plan === "solo" || quota.plan === "pro" ? (
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/billing">Manage billing</Link>
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
    const frame = requestAnimationFrame(() => {
      void refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return { quota, refreshQuota: refresh };
}
