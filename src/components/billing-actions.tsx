"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

import {
  BILLING,
  priceLabelForTier,
  type PaidPlanTier,
} from "@/lib/billing/constants";
import { Button } from "@/components/ui/button";

export function StripeSetupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSetup() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start card verification.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={startSetup} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Redirecting to Stripe…
          </>
        ) : (
          <>
            <CreditCard />
            Verify my card (€0)
          </>
        )}
      </Button>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Stripe may show a temporary authorization (often €0) to validate the
        card. No subscription starts at this step. Next:{" "}
        {BILLING.TRIAL_GENERATIONS} free generations.
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type StripeSubscribeButtonProps = {
  plan: PaidPlanTier;
  variant?: "default" | "outline" | "secondary";
};

export function StripeSubscribeButton({
  plan,
  variant = "default",
}: StripeSubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = plan === "solo" ? "Solo" : "Pro";

  async function startSubscribe() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", plan }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start the subscription.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full"
        variant={variant}
        onClick={startSubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Redirecting to Stripe…
          </>
        ) : (
          <>
            <CreditCard />
            Subscribe {label} ({priceLabelForTier(plan)})
          </>
        )}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
