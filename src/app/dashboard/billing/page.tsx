import Link from "next/link";
import { Sparkles, Users } from "lucide-react";

import { StripeSubscribeButton } from "@/components/billing-actions";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { BILLING } from "@/lib/billing/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BillingPageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { success, canceled } = await searchParams;

  return (
    <>
      <DashboardNav />
      <BillingQuotaBanner />

      <div className="mb-6 max-w-3xl space-y-3">
        {success === "1" ? (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
            Subscription active (or confirming with Stripe). You can generate
            patch notes.
          </p>
        ) : null}
        {canceled === "1" ? (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
            Payment canceled. You can try again anytime.
          </p>
        ) : null}
      </div>

      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Solo
            </CardTitle>
            <CardDescription>
              {BILLING.SOLO_PRICE_LABEL} · {BILLING.SOLO_MONTHLY_GENERATIONS}{" "}
              generations / month | 1 user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ GitHub / GitLab import or manual paste</li>
              <li>✓ Patch note history</li>
              <li>✓ Upcoming integrations (Jira…)</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <StripeSubscribeButton plan="solo" variant="outline" />
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" />
              Pro
            </CardTitle>
            <CardDescription>
              {BILLING.PRO_PRICE_LABEL} · {BILLING.PRO_MONTHLY_GENERATIONS}{" "}
              generations / month | team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Everything in Solo, larger quota</li>
              <li>✓ Several users on one account (coming soon)</li>
              <li>✓ Ideal for studios &amp; live ops</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <StripeSubscribeButton plan="pro" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/generate">Back to generator</Link>
        </Button>
      </div>
    </>
  );
}
