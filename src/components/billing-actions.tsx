"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

import { BILLING } from "@/lib/billing/constants";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Impossible de démarrer la vérification.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={startSetup} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Redirection Stripe…
          </>
        ) : (
          <>
            <CreditCard />
            Vérifier ma carte (0 €)
          </>
        )}
      </Button>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Stripe peut afficher une autorisation temporaire (souvent 0 €) pour valider
        la carte. Aucun abonnement n&apos;est activé à cette étape. Ensuite :{" "}
        {BILLING.TRIAL_GENERATIONS} générations offertes.
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function StripeSubscribeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSubscribe() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe" }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Impossible de démarrer l'abonnement.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={startSubscribe} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Redirection Stripe…
          </>
        ) : (
          <>
            <CreditCard />
            S&apos;abonner — {BILLING.PRO_PRICE_LABEL}
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
