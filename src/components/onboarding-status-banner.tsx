"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type OnboardingStatusBannerProps = {
  setup?: string;
};

export function OnboardingStatusBanner({ setup }: OnboardingStatusBannerProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/billing", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { paymentMethodVerified?: boolean };
        if (data.paymentMethodVerified) {
          router.push("/dashboard/generate?welcome=1");
          router.refresh();
          return;
        }
      }
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  if (setup === "success") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          <p>
            Card saved. If Stripe is still confirming the webhook, refresh in a
            few seconds or continue.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="animate-spin" /> : null}
          Refresh status
        </Button>
      </div>
    );
  }

  if (setup === "canceled") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <p>
            Card verification was canceled. You can try again whenever you are
            ready — still €0 today.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="animate-spin" /> : null}
          Check status
        </Button>
      </div>
    );
  }

  return null;
}
