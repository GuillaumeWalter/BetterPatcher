"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Loader2, Sparkles } from "lucide-react";

import { BILLING } from "@/lib/billing/constants";
import type { QuotaSnapshot } from "@/lib/billing/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BillingQuotaBanner() {
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/billing");
        if (response.ok) {
          setQuota((await response.json()) as QuotaSnapshot);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading || !quota) return null;

  const label =
    quota.plan === "pro"
      ? "Pro"
      : quota.plan === "trial"
        ? "Essai"
        : quota.plan === "blocked"
          ? "Essai terminé"
          : "Activation requise";

  return (
    <div className="surface-card gradient-border mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{label}</Badge>
          {quota.paymentMethodVerified ? (
            <span className="text-sm text-muted-foreground">
              {quota.generationsRemaining} / {quota.generationsLimit} restantes
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Carte requise — aucun prélèvement aujourd&apos;hui
            </span>
          )}
        </div>
        {quota.requiresSetup ? (
          <p className="text-sm text-muted-foreground">
            Vérifiez votre CB pour débloquer {BILLING.TRIAL_GENERATIONS} générations
            gratuites (anti-abus).
          </p>
        ) : quota.requiresSubscription ? (
          <p className="text-sm text-muted-foreground">
            Passez au Pro ({BILLING.PRO_PRICE_LABEL}) pour{" "}
            {BILLING.PRO_MONTHLY_GENERATIONS} générations / mois.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {quota.requiresSetup ? (
          <Button asChild size="sm">
            <Link href="/onboarding">
              <CreditCard />
              Activer mon essai
            </Link>
          </Button>
        ) : null}
        {quota.requiresSubscription ? (
          <Button asChild size="sm">
            <Link href="/dashboard/billing">
              <Sparkles />
              Passer au Pro
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
    const response = await fetch("/api/billing");
    if (response.ok) {
      setQuota((await response.json()) as QuotaSnapshot);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { quota, refreshQuota: refresh };
}
