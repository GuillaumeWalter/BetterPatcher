import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardPaste,
  CreditCard,
  GitBranch,
  Share2,
  Shield,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";

import { auth, signIn } from "@/auth";
import { DemoPatchGenerator } from "@/components/demo-patch-generator";
import { LandingProductPreview } from "@/components/landing-product-preview";
import { StructuredData } from "@/components/structured-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BILLING } from "@/lib/billing/constants";
import { getLocalizedBillingLabels } from "@/lib/billing/localized-labels";
import { APP } from "@/lib/routes";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata = pageMetadata({ path: "/" });

const steps = [
  {
    icon: ClipboardPaste,
    title: "Paste any commit log",
    description:
      "Perforce, Plastic, SVN, or plain text. GitHub and GitLab import are optional extras.",
  },
  {
    icon: Sparkles,
    title: "Generate the patch note",
    description:
      "Pick a tone (technical, marketing, gaming). Get Markdown release notes in seconds.",
  },
  {
    icon: Share2,
    title: "Adapt and share",
    description:
      "Share Studio drafts for Discord, X, LinkedIn, Steam-style, and more. Copy or publish.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect(APP.home);
  }

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

      <div className="relative overflow-hidden">
        <section className="relative mx-auto flex min-h-[min(92vh,56rem)] max-w-5xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-16">
          <div className="landing-hero-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-full" />

          <p className="landing-fade-up mb-5 text-sm font-medium tracking-wide text-primary/90">
            Easy Patch
          </p>
          <h1 className="landing-fade-up landing-fade-up-delay-1 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.12] lg:text-6xl">
            <span className="gradient-text">Commits in.</span>
            <span className="mt-1 block">Patch notes out.</span>
          </h1>
          <p className="landing-fade-up landing-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste any VCS log (no GitHub required). Get Markdown release notes
            and social drafts ready to ship.
          </p>

          <div className="landing-fade-up landing-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/onboarding" });
              }}
            >
              <Button size="lg" type="submit" className="landing-cta-pulse">
                Start free trial
              </Button>
            </form>
            <Button size="lg" variant="outline" asChild>
              <Link href="#try">Try without account</Link>
            </Button>
          </div>
          <p className="landing-fade-up landing-fade-up-delay-3 mt-4 text-xs text-muted-foreground">
            Trial · {BILLING.TRIAL_GENERATIONS} generations · card required (€0
            today) · CLI and Raycast available after signup
          </p>

          <LandingProductPreview />
        </section>

        <section
          id="how"
          className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-16 sm:px-6"
        >
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Three steps from a raw log to something you can ship to players or
            customers.
          </p>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="landing-fade-up space-y-3"
                style={{ animationDelay: `${0.08 * (index + 1)}s` }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <step.icon className="size-4 text-primary" aria-hidden />
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="try"
          className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-16 sm:px-6"
        >
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">
            Try it free
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Paste a log (or load sample commits). No account needed for a quick
            demo.
          </p>
          <DemoPatchGenerator />
        </section>

        <section
          id="pricing"
          className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-16 sm:px-6"
        >
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Start on Trial, then Solo or Pro when you need monthly volume or a
            team.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="surface-card gradient-border">
              <CardHeader>
                <CardTitle className="text-lg">Trial</CardTitle>
                <CardDescription>
                  €0 | card required (abuse prevention)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  Stripe verification (no charge today)
                </p>
                <ul className="space-y-1.5">
                  <li>· {BILLING.TRIAL_GENERATIONS} free generations</li>
                  <li>· Paste any log, or GitHub / GitLab</li>
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
                  <li>· Monthly quotas + history</li>
                  <li>· Ideal for indies and solo marketers</li>
                  <li>· Cancel anytime</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="surface-card gradient-border border-primary/20">
              <CardHeader>
                <div className="mb-1 flex items-center gap-2">
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <Badge variant="secondary">Team</Badge>
                </div>
                <CardDescription>{proPriceLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  {BILLING.PRO_MONTHLY_GENERATIONS} generations / month | team
                </p>
                <ul className="space-y-1.5">
                  <li>
                    · Up to {BILLING.PRO_MAX_TEAM_SEATS} users on one Pro account
                  </li>
                  <li>· Shared history and quota</li>
                  <li>· Cancel anytime</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
          <div className="rounded-2xl border border-border/70 bg-[image:var(--gradient-warm-soft)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl space-y-2">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <GitBranch className="size-5 text-primary" aria-hidden />
                  Where do your commits live?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Paste a Perforce, Plastic (Unity Version Control), SVN, or any
                  other VCS log. Import from GitHub or GitLab when it helps.
                  Solo and Pro can connect Linear to enrich notes with ticket
                  titles from commit keys.
                </p>
              </div>
              <Button asChild className="shrink-0 self-start">
                <Link href="#try">Paste a log</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Terminal className="size-4 text-primary" aria-hidden />
                CLI and Raycast
              </h2>
              <p className="text-sm text-muted-foreground">
                After signup, generate from a terminal or Raycast with the same
                paste workflow. No browser required for each release.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link
                href="https://github.com/GuillaumeWalter/BetterPatcher/blob/master/docs/cli.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                CLI docs
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
