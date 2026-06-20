import Link from "next/link";
import { Sparkles } from "lucide-react";

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

      <Card className="surface-card gradient-border max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            Plan Pro
          </CardTitle>
          <CardDescription>
            {BILLING.PRO_PRICE_LABEL} · {BILLING.PRO_MONTHLY_GENERATIONS}{" "}
            générations / mois · historique inclus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {success === "1" ? (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
              Abonnement activé (ou en cours de confirmation Stripe). Vous pouvez
              générer vos patch notes.
            </p>
          ) : null}
          {canceled === "1" ? (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
              Paiement annulé. Vous pouvez réessayer quand vous voulez.
            </p>
          ) : null}

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Import GitHub ou collage manuel (Perforce, SVN, etc.)</li>
            <li>✓ {BILLING.PRO_MONTHLY_GENERATIONS} générations IA / mois (plafond anti-surcoût)</li>
            <li>✓ Historique et édition des patch notes</li>
            <li>✓ Annulation à tout moment via Stripe</li>
          </ul>

          <StripeSubscribeButton />

          <Button variant="outline" asChild>
            <Link href="/dashboard/generate">Retour au générateur</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
