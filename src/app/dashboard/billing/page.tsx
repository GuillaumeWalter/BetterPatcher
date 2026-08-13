import Link from "next/link";

import { auth } from "@/auth";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { BillingPlans } from "@/components/billing-plans";
import { DashboardNav } from "@/components/dashboard-nav";
import { getUserQuota } from "@/lib/supabase/users";
import { Button } from "@/components/ui/button";
import {
  billingLabelsForCurrency,
  resolveBillingCurrency,
} from "@/lib/billing/currency";
import { headers } from "next/headers";

type BillingPageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();
  const quota = session?.user?.id
    ? await getUserQuota(session.user.id)
    : null;
  const { success, canceled } = await searchParams;
  const h = await headers();
  const currency = resolveBillingCurrency(h);
  const monthly = billingLabelsForCurrency(currency, "monthly");
  const annual = billingLabelsForCurrency(currency, "annual");
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
        {quota?.teamOwnerId ? (
          <p className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm">
            You are on a Pro team — generations use the shared team quota.
          </p>
        ) : null}
      </div>

      <BillingPlans
        soloMonthlyLabel={monthly.soloPriceLabel}
        proMonthlyLabel={monthly.proPriceLabel}
        soloAnnualLabel={annual.soloPriceLabel}
        proAnnualLabel={annual.proPriceLabel}
        currentPlan={quota?.plan}
        isSubscribed={isSubscribed}
      />

      <Button variant="outline" className="mt-6" asChild>
        <Link href="/dashboard/generate">Back to generator</Link>
      </Button>
    </>
  );
}
