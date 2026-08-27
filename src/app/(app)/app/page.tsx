import Link from "next/link";
import { ArrowRight, History, Sparkles, Wand2 } from "lucide-react";

import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { GuidedOnboarding } from "@/components/guided-onboarding";
import { SetupChecklist } from "@/components/setup-checklist";
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
import { TONE_OPTIONS } from "@/lib/constants";
import { APP } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import {
  countPatchNotesForUser,
  listPatchNotesForUser,
} from "@/lib/supabase/patch-notes";
import { getUserQuota } from "@/lib/supabase/users";

export const metadata = pageMetadata({
  title: "App",
  description: "Generate patch notes, browse history, and manage your plan.",
  path: APP.home,
  noIndex: true,
});

function toneLabel(tone: string) {
  return TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AppHomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const quota = userId ? await getUserQuota(userId) : null;
  const notes = userId ? await listPatchNotesForUser(userId) : [];
  const generationCount = userId ? await countPatchNotesForUser(userId) : 0;
  const hasGenerated =
    generationCount > 0 || (quota?.generationsUsed ?? 0) > 0;
  const { soloPriceLabel, proPriceLabel } = await getLocalizedBillingLabels();
  const recent = notes.slice(0, 5);

  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome
          {session?.user?.name ? (
            <>
              ,{" "}
              <span className="gradient-text">{session.user.name}</span>
            </>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste any commit log first. GitHub and GitLab import are optional.
        </p>
      </div>

      <AppNav />
      <BillingQuotaBanner />
      <GuidedOnboarding hasGenerated={hasGenerated} variant="dashboard" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <SetupChecklist />
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="size-5 text-primary" />
              Generate
            </CardTitle>
            <CardDescription>
              Paste any commit log, or import GitHub / GitLab.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={APP.generate}>
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
              Past notes with the commits used to generate them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href={APP.history}>
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
              {soloPriceLabel} ({BILLING.SOLO_MONTHLY_GENERATIONS}/mo) · Pro:{" "}
              {proPriceLabel} ({BILLING.PRO_MONTHLY_GENERATIONS}/mo | team)
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
              <Link href={APP.billing}>Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Recent notes
            </h2>
            <p className="text-sm text-muted-foreground">
              Includes the source commits merged into each note.
            </p>
          </div>
          {notes.length > 0 ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={APP.history}>See all</Link>
            </Button>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <Card className="surface-card gradient-border">
            <CardHeader>
              <CardTitle className="text-base">No notes yet</CardTitle>
              <CardDescription>
                Your first generation will show up here with its source log.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={APP.generate}>Generate a patch note</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {recent.map((note) => (
              <li key={note.id}>
                <Link href={APP.historyItem(note.id)} className="block">
                  <Card className="surface-card gradient-border transition-all hover:shadow-md hover:shadow-primary/5">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base font-medium">
                          {note.repoFullName ?? "Pasted commits"}
                        </CardTitle>
                        <Badge variant="secondary">{toneLabel(note.tone)}</Badge>
                        <Badge variant="outline">
                          {note.commitLineCount} source line
                          {note.commitLineCount === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {formatDate(note.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {note.commitsPreview ? (
                        <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
                          Sources: {note.commitsPreview}
                        </p>
                      ) : null}
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {note.markdownPreview}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
