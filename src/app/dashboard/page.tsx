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
              Générateur
            </CardTitle>
            <CardDescription>
              Collez vos commits ou importez GitHub — patch note + post réseaux.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/generate">
                Ouvrir le générateur
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="size-5 text-primary" />
              Historique
            </CardTitle>
            <CardDescription>
              Retrouvez et éditez vos patch notes déjà générées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/history">
                Voir l&apos;historique
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Abonnement
            </CardTitle>
            <CardDescription>
              Essai : {BILLING.TRIAL_GENERATIONS} générations · Pro :{" "}
              {BILLING.PRO_PRICE_LABEL} ({BILLING.PRO_MONTHLY_GENERATIONS}/mois)
              {quota ? (
                <>
                  {" "}
                  · Vous : {quota.generationsRemaining}/{quota.generationsLimit}{" "}
                  restantes
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/billing">Gérer l&apos;abonnement</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
