import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CreditCard } from "lucide-react";

import { auth } from "@/auth";
import { StripeSetupButton } from "@/components/billing-actions";
import { BILLING } from "@/lib/billing/constants";
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

  return (
    <div className="mx-auto flex max-w-lg flex-1 items-center px-4 py-16">
      <Card className="surface-card gradient-border w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15">
            <CreditCard className="size-7" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Activez votre essai
          </CardTitle>
          <CardDescription className="text-base">
            Compte créé pour{" "}
            <span className="font-medium text-foreground">
              {session.user.name ?? session.user.email}
            </span>
            . Une carte est requise pour limiter les abus —{" "}
            <strong className="text-foreground">0 € aujourd&apos;hui</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {setupSuccess ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <p>
                Carte enregistrée. Si Stripe confirme encore le webhook, actualisez
                dans quelques secondes ou continuez.
              </p>
            </div>
          ) : null}

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              ✓ {BILLING.TRIAL_GENERATIONS} patch notes offertes après vérification
            </li>
            <li>✓ Coller vos commits ou importer GitHub (optionnel)</li>
            <li>
              ✓ Ensuite Pro : {BILLING.PRO_PRICE_LABEL} ·{" "}
              {BILLING.PRO_MONTHLY_GENERATIONS} générations / mois
            </li>
          </ul>

          <StripeSetupButton />

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
