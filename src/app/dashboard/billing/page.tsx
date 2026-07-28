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
            Abonnement activé (ou en cours de confirmation Stripe). Vous pouvez
            générer vos patch notes.
          </p>
        ) : null}
        {canceled === "1" ? (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
            Paiement annulé. Vous pouvez réessayer quand vous voulez.
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
              générations / mois · 1 utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Import GitHub ou collage manuel</li>
              <li>✓ Historique des patch notes</li>
              <li>✓ Intégrations à venir (GitLab, Jira…)</li>
              <li>✓ Annulation à tout moment</li>
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
              générations / mois · équipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Tout Solo, quota plus généreux</li>
              <li>✓ Plusieurs utilisateurs sur le même compte (bientôt)</li>
              <li>✓ Idéal studios &amp; live ops</li>
              <li>✓ Annulation à tout moment</li>
            </ul>
            <StripeSubscribeButton plan="pro" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/generate">Retour au générateur</Link>
        </Button>
      </div>
    </>
  );
}
