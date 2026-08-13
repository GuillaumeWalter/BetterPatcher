"use client";

import { useState } from "react";

import {
  StripePortalButton,
  StripeSubscribeButton,
} from "@/components/billing-actions";
import { BillingIntervalToggle } from "@/components/billing-interval-toggle";
import { BILLING } from "@/lib/billing/constants";
import type { BillingInterval } from "@/lib/billing/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";

type BillingPlansProps = {
  soloMonthlyLabel: string;
  proMonthlyLabel: string;
  soloAnnualLabel: string;
  proAnnualLabel: string;
  currentPlan: string | undefined;
  isSubscribed: boolean;
};

export function BillingPlans({
  soloMonthlyLabel,
  proMonthlyLabel,
  soloAnnualLabel,
  proAnnualLabel,
  currentPlan,
  isSubscribed,
}: BillingPlansProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const soloLabel = interval === "annual" ? soloAnnualLabel : soloMonthlyLabel;
  const proLabel = interval === "annual" ? proAnnualLabel : proMonthlyLabel;

  return (
    <>
      {!isSubscribed ? (
        <div className="mb-6 max-w-3xl">
          <BillingIntervalToggle
            value={interval}
            onChange={setInterval}
            annualDiscountPercent={BILLING.ANNUAL_DISCOUNT_PERCENT}
          />
        </div>
      ) : null}

      {isSubscribed ? (
        <Card className="surface-card gradient-border mb-6 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg">
              Your plan: {currentPlan === "solo" ? "Solo" : "Pro"}
            </CardTitle>
            <CardDescription>
              Manage billing interval or payment method in the Stripe portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripePortalButton />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Solo
            </CardTitle>
            <CardDescription>
              {soloLabel} · {BILLING.SOLO_MONTHLY_GENERATIONS} generations /
              month | 1 user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ GitHub / GitLab import or manual paste</li>
              <li>✓ Patch note history</li>
              <li>✓ Share Studio drafts</li>
              <li>✓ Cancel anytime</li>
            </ul>
            {currentPlan !== "solo" && currentPlan !== "pro" ? (
              <StripeSubscribeButton
                plan="solo"
                variant="outline"
                priceLabel={soloLabel}
                interval={interval}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" />
              Pro
            </CardTitle>
            <CardDescription>
              {proLabel} · {BILLING.PRO_MONTHLY_GENERATIONS} generations / month
              | up to {BILLING.PRO_MAX_TEAM_SEATS} seats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Higher monthly quota</li>
              <li>
                ✓ Team seats — invite {BILLING.PRO_MAX_TEAM_SEATS - 1} teammates
              </li>
              <li>✓ Ideal for studios &amp; live ops</li>
              <li>✓ Cancel anytime</li>
            </ul>
            {currentPlan !== "pro" ? (
              <StripeSubscribeButton
                plan="pro"
                priceLabel={proLabel}
                interval={interval}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
