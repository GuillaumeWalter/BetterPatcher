import Link from "next/link";
import { ArrowRight, History, Sparkles, Wand2 } from "lucide-react";

import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { BILLING } from "@/lib/billing/constants";
import { getUserQuota } from "@/lib/supabase/users";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const quota = session?.user?.id ? await getUserQuota(session.user.id) : null;

  return (
    <>
      <DashboardNav />
      <BillingQuotaBanner />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="size-5 text-primary" />
              Generator
            </CardTitle>
            <CardDescription>
              Import GitHub or paste manually (Perforce, Plastic, SVN…).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/generate">
                Open generator
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="size-5 text-primary" />
              History
            </CardTitle>
            <CardDescription>
              Find and edit patch notes you already generated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/history">
                View history
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Subscription
            </CardTitle>
            <CardDescription>
              Trial: {BILLING.TRIAL_GENERATIONS} generations · Solo:{" "}
              {BILLING.SOLO_PRICE_LABEL} ({BILLING.SOLO_MONTHLY_GENERATIONS}/mo)
              · Pro: {BILLING.PRO_PRICE_LABEL} (
              {BILLING.PRO_MONTHLY_GENERATIONS}/mo | team)
              {quota ? (
                <>
                  {" "}
                  · You: {quota.generationsRemaining}/{quota.generationsLimit}{" "}
                  left
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/billing">Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
