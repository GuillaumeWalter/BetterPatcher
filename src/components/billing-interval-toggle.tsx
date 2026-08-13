"use client";

import type { BillingInterval } from "@/lib/billing/constants";
import { cn } from "@/lib/utils";

type BillingIntervalToggleProps = {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  annualDiscountPercent?: number;
};

export function BillingIntervalToggle({
  value,
  onChange,
  annualDiscountPercent = 15,
}: BillingIntervalToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border/70 bg-muted/60 p-1"
      role="group"
      aria-label="Billing interval"
    >
      <button
        type="button"
        className={cn(
          "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
          value === "monthly"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        type="button"
        className={cn(
          "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
          value === "annual"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "annual"}
        onClick={() => onChange("annual")}
      >
        Annual
        <span className="ml-1.5 text-xs text-primary">
          −{annualDiscountPercent}%
        </span>
      </button>
    </div>
  );
}
