"use client";

import { useEffect, useState } from "react";

import type { QuotaSnapshot } from "@/lib/billing/constants";
import { Badge } from "@/components/ui/badge";

export function HeaderPlanBadge() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/billing");
        if (!response.ok) return;

        const quota = (await response.json()) as QuotaSnapshot;

        if (quota.plan === "pro") {
          setLabel(`Pro · ${quota.generationsRemaining} restantes`);
        } else if (quota.plan === "trial") {
          setLabel(`Essai · ${quota.generationsRemaining} restantes`);
        } else if (quota.plan === "blocked") {
          setLabel("Essai terminé");
        } else if (quota.requiresSetup) {
          setLabel("Activation requise");
        }
      } catch {
        // Non connecté ou erreur — pas de badge
      }
    }

    load();
  }, []);

  if (!label) return null;

  return (
    <Badge
      variant="secondary"
      className="hidden border border-primary/15 bg-primary/8 text-primary sm:inline-flex"
    >
      {label}
    </Badge>
  );
}
