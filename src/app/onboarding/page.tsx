import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CreditCard } from "lucide-react";

import { auth } from "@/auth";
import { StripeSetupButton } from "@/components/billing-actions";
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

type OnboardingPageProps = {
  searchParams: Promise<{ setup?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const quota = await getUserQuota(session.user.id!);
  if (quota?.paymentMethodVerified) {
    redirect("/dashboard/generate");
  }

  const { setup } = await searchParams;
  const setupSuccess = setup === "success";
  const { soloPriceLabel, proPriceLabel } = await getLocalizedBillingLabels();

  return (
    <div className="mx-auto flex max-w-lg flex-1 items-center px-4 py-16">
      <Card className="surface-card gradient-border w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15">
            <CreditCard className="size-7" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Activate your trial
          </CardTitle>
          <CardDescription className="text-base">
            Account created for{" "}
            <span className="font-medium text-foreground">
              {session.user.name ?? session.user.email}
            </span>
            . A card is required to limit abuse:{" "}
            <strong className="text-foreground">€0 today</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {setupSuccess ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <p>
                Card saved. If Stripe is still confirming the webhook, refresh
                in a few seconds or continue.
              </p>
            </div>
          ) : null}

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              ✓ {BILLING.TRIAL_GENERATIONS} patch notes after verification
            </li>
            <li>✓ Paste commits or import GitHub (optional)</li>
            <li>
              ✓ Then Solo ({soloPriceLabel}) or Pro ({proPriceLabel} | team)
            </li>
          </ul>

          <StripeSetupButton />

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
