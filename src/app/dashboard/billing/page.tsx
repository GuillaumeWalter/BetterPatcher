import Link from "next/link";

import { auth } from "@/auth";
import { StripePortalButton, StripeSubscribeButton } from "@/components/billing-actions";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { BILLING } from "@/lib/billing/constants";
import { getLocalizedBillingLabels } from "@/lib/billing/localized-labels";
import { getUserQuota } from "@/lib/supabase/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";

type BillingPageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();
  const quota = session?.user?.id
    ? await getUserQuota(session.user.id)
    : null;
  const { success, canceled } = await searchParams;
  const { soloPriceLabel, proPriceLabel } = await getLocalizedBillingLabels();
  const isSubscribed = quota?.plan === "solo" || quota?.plan === "pro";

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
        {isSubscribed && !quota?.canGenerate && quota?.generationsRemaining === 0 ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm">
            Your subscription may have a payment issue. Update your card in the
            Stripe portal below.
          </p>
        ) : null}
      </div>

      {isSubscribed ? (
        <Card className="surface-card gradient-border mb-6 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg">Your plan: {quota?.plan === "solo" ? "Solo" : "Pro"}</CardTitle>
            <CardDescription>
              {quota?.generationsRemaining ?? 0} / {quota?.generationsLimit ?? 0}{" "}
              generations left this month
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
              {soloPriceLabel} · {BILLING.SOLO_MONTHLY_GENERATIONS}{" "}
              generations / month | 1 user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ GitHub / GitLab import or manual paste</li>
              <li>✓ Patch note history</li>
              <li>✓ Share Studio drafts</li>
              <li>✓ Cancel anytime</li>
            </ul>
            {quota?.plan !== "solo" && quota?.plan !== "pro" ? (
              <StripeSubscribeButton
                plan="solo"
                variant="outline"
                priceLabel={soloPriceLabel}
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
              {proPriceLabel} · {BILLING.PRO_MONTHLY_GENERATIONS}{" "}
              generations / month | team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Higher monthly quota</li>
              <li>✓ Team seats (coming soon)</li>
              <li>✓ Ideal for studios &amp; live ops</li>
              <li>✓ Cancel anytime</li>
            </ul>
            {quota?.plan !== "pro" ? (
              <StripeSubscribeButton plan="pro" priceLabel={proPriceLabel} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" className="mt-6" asChild>
        <Link href="/dashboard/generate">Back to generator</Link>
      </Button>
    </>
  );
}
