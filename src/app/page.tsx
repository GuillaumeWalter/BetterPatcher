import Link from "next/link";
import { GitBranch, CreditCard, Shield, Sparkles, Users, Zap } from "lucide-react";

import { auth, signIn } from "@/auth";
import { DemoPatchGenerator } from "@/components/demo-patch-generator";
import { StructuredData } from "@/components/structured-data";
import { BILLING } from "@/lib/billing/constants";
import { getLocalizedBillingLabels } from "@/lib/billing/localized-labels";
import { pageMetadata, siteUrl } from "@/lib/seo";
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
    label: "Commits to changelog",
    description: "GitHub / GitLab import, or paste Perforce / Plastic / SVN",
  },
  {
    icon: Sparkles,
    label: "Tone of your choice",
    description: "Technical, marketing, or gaming / devlog",
  },
  {
    icon: Zap,
    label: "Social post included",
    description: "LinkedIn, X, Discord | ready to publish",
  },
];

export const metadata = pageMetadata({ path: "/" });

export default async function Home() {
  const session = await auth();
  const { soloPriceLabel, proPriceLabel } = await getLocalizedBillingLabels();

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Easy Patch",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: siteUrl("/"),
          offers: [
            {
              "@type": "Offer",
              name: "Solo",
              price: "4.99",
              priceCurrency: "EUR",
              description: `${BILLING.SOLO_MONTHLY_GENERATIONS} generations per month`,
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "9.99",
              priceCurrency: "EUR",
              description: `${BILLING.PRO_MONTHLY_GENERATIONS} generations per month`,
            },
          ],
        }}
      />
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="relative mb-14 space-y-6 text-center sm:text-left">
        <Badge
          variant="secondary"
          className="border border-primary/15 bg-primary/8 px-3 py-1 text-primary"
        >
          AI patch notes | Trial then Solo / Pro
        </Badge>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.15]">
            <span className="gradient-text">Easy Patch</span>
            <span className="block sm:inline">
              {" "}
              turns commits into a patch note
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Import GitHub or GitLab, or paste any log. Get Markdown release notes
            and a social post ready to publish. Create an account, verify your
            card (€0), try {BILLING.TRIAL_GENERATIONS} times, then pick Solo or
            Pro.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
          {session?.user ? (
            <Button size="lg" asChild>
              <Link href="/dashboard/generate">Open the app</Link>
            </Button>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/onboarding" });
              }}
            >
              <Button size="lg" type="submit">
                Start with GitHub
              </Button>
            </form>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link href="#try">Try free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">See pricing</Link>
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

      <section id="try" className="mb-14 scroll-mt-24">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          Try without an account
        </h2>
        <DemoPatchGenerator />
      </section>

      <section id="pricing" className="mb-14 scroll-mt-24">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="surface-card gradient-border">
            <CardHeader>
              <CardTitle className="text-lg">Trial</CardTitle>
              <CardDescription>€0 | card required (abuse prevention)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Stripe verification (no charge today)
              </p>
              <ul className="space-y-1.5">
                <li>· {BILLING.TRIAL_GENERATIONS} free generations</li>
                <li>· GitHub / GitLab or manual paste</li>
                <li>· History included</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="surface-card gradient-border">
            <CardHeader>
              <CardTitle className="text-lg">Solo</CardTitle>
              <CardDescription>{soloPriceLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                {BILLING.SOLO_MONTHLY_GENERATIONS} generations / month | 1 user
              </p>
              <ul className="space-y-1.5">
                <li>· Everything in Trial plus monthly quotas</li>
                <li>· Ideal for indies &amp; solo marketers</li>
                <li>· Cancel anytime</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="surface-card gradient-border border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro</CardTitle>
              <CardDescription>{proPriceLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                {BILLING.PRO_MONTHLY_GENERATIONS} generations / month | team
              </p>
              <ul className="space-y-1.5">
                <li>· Up to {BILLING.PRO_MAX_TEAM_SEATS} users on one Pro account</li>
                <li>· Ideal for studios &amp; live ops</li>
                <li>· Cancel anytime</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="surface-card gradient-border rounded-2xl p-6 text-center sm:text-left">
        <h2 className="text-xl font-semibold">Where do your commits live?</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Import from GitHub or GitLab, or paste a Perforce, Plastic (Unity
          Version Control), SVN, or any other VCS log. Jira / Linear ticket
          enrichment is coming next for every subscriber.
        </p>
      </section>
    </div>
    </>
  );
}
