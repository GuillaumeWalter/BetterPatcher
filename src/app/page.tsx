import Link from "next/link";
import { GitBranch, CreditCard, Shield, Sparkles, Users, Zap } from "lucide-react";

import { auth, signIn } from "@/auth";
import { BILLING } from "@/lib/billing/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: GitBranch,
    label: "Commits → changelog",
    description: "GitHub, collage Perforce / Plastic / SVN, ou tout log texte",
  },
  {
    icon: Sparkles,
    label: "Tonalité au choix",
    description: "Technique, marketing ou gaming / devlog",
  },
  {
    icon: Zap,
    label: "Post réseaux inclus",
    description: "LinkedIn, X, Discord — prêt à publier",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="relative mb-14 space-y-6 text-center sm:text-left">
        <Badge
          variant="secondary"
          className="border border-primary/15 bg-primary/8 px-3 py-1 text-primary"
        >
          Patch notes IA · Essai puis Solo / Pro
        </Badge>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.15]">
            De vos commits au{" "}
            <span className="gradient-text">patch note</span>, sans prise de tête
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Easy Patch transforme un log brut en changelog Markdown et post
            réseaux. Créez un compte, vérifiez votre carte (0 €), testez{" "}
            {BILLING.TRIAL_GENERATIONS} fois, puis choisissez Solo ou Pro.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
          {session?.user ? (
            <Button size="lg" asChild>
              <Link href="/dashboard/generate">Ouvrir l&apos;app</Link>
            </Button>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/onboarding" });
              }}
            >
              <Button size="lg" type="submit">
                Commencer avec GitHub
              </Button>
            </form>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link href="#tarifs">Voir les tarifs</Link>
          </Button>
        </div>

        <div className="grid gap-3 pt-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="surface-card gradient-border rounded-2xl p-4 text-left"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4" />
              </div>
              <p className="text-sm font-semibold">{feature.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="tarifs" className="mb-14 scroll-mt-24">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Tarifs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="surface-card gradient-border">
            <CardHeader>
              <CardTitle className="text-lg">Essai</CardTitle>
              <CardDescription>0 € · carte requise (anti-abus)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Vérification Stripe — pas de prélèvement aujourd&apos;hui
              </p>
              <ul className="space-y-1.5">
                <li>· {BILLING.TRIAL_GENERATIONS} générations offertes</li>
                <li>· GitHub ou collage manuel</li>
                <li>· Historique inclus</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="surface-card gradient-border">
            <CardHeader>
              <CardTitle className="text-lg">Solo</CardTitle>
              <CardDescription>{BILLING.SOLO_PRICE_LABEL}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                {BILLING.SOLO_MONTHLY_GENERATIONS} générations / mois · 1 utilisateur
              </p>
              <ul className="space-y-1.5">
                <li>· Tout l&apos;essai + quotas mensuels</li>
                <li>· Idéal indés &amp; solo marketers</li>
                <li>· Annulation à tout moment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="surface-card gradient-border border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro</CardTitle>
              <CardDescription>{BILLING.PRO_PRICE_LABEL}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                {BILLING.PRO_MONTHLY_GENERATIONS} générations / mois · équipe
              </p>
              <ul className="space-y-1.5">
                <li>· Plusieurs users sur le même compte (bientôt)</li>
                <li>· Idéal studios &amp; live ops</li>
                <li>· Annulation à tout moment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="surface-card gradient-border rounded-2xl p-6 text-center sm:text-left">
        <h2 className="text-xl font-semibold">D&apos;où viennent vos commits ?</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Import automatique depuis GitHub, ou collez un log Perforce, Plastic
          (Unity Version Control), SVN ou tout autre VCS. GitLab et Jira arrivent
          bientôt pour tous les abonnés — pas réservés au Pro.
        </p>
      </section>
    </div>
  );
}
