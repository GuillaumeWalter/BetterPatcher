"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  History,
  Share2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STORAGE_KEY = "easy-patch-onboarding-v1";

type GuidedOnboardingProps = {
  welcome?: boolean;
  hasGenerated: boolean;
  variant?: "dashboard" | "generate";
};

type StepId = "import" | "generate" | "share" | "history";

const STEPS: Array<{
  id: StepId;
  label: string;
  description: string;
  icon: typeof Wand2;
  href?: string;
}> = [
  {
    id: "import",
    label: "Import commits",
    description: "GitHub, GitLab, or paste a log from any VCS.",
    icon: Sparkles,
  },
  {
    id: "generate",
    label: "Generate patch note",
    description: "Pick a tone and hit Generate. Streaming takes ~15s.",
    icon: Wand2,
  },
  {
    id: "share",
    label: "Edit in Share Studio",
    description: "Polish Markdown and copy per-platform drafts.",
    icon: Share2,
  },
  {
    id: "history",
    label: "Find it in history",
    description: "Reopen, edit, or regenerate drafts anytime.",
    icon: History,
    href: "/dashboard/history",
  },
];

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "done";
}

function dismissOnboarding() {
  window.localStorage.setItem(STORAGE_KEY, "done");
}

function stepComplete(id: StepId, hasGenerated: boolean): boolean {
  if (id === "import") return hasGenerated;
  if (id === "generate") return hasGenerated;
  if (id === "share") return hasGenerated;
  if (id === "history") return hasGenerated;
  return false;
}

export function GuidedOnboarding({
  welcome = false,
  hasGenerated,
  variant = "generate",
}: GuidedOnboardingProps) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      setDismissed(readDismissed());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasGenerated || !mounted || readDismissed()) return;
    const frame = requestAnimationFrame(() => {
      dismissOnboarding();
      setDismissed(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [hasGenerated, mounted]);

  if (!mounted || dismissed) {
    if (!welcome || dismissed) return null;

    return (
      <WelcomeBanner
        hasGenerated={hasGenerated}
        onDismiss={() => {
          dismissOnboarding();
          setDismissed(true);
        }}
      />
    );
  }

  const completedCount = STEPS.filter((step) =>
    stepComplete(step.id, hasGenerated),
  ).length;

  if (variant === "dashboard" && hasGenerated) {
    return null;
  }

  return (
    <Card className="surface-card gradient-border mb-6 border-primary/20">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            {welcome ? "Trial activated — quick start" : "Getting started"}
          </CardTitle>
          <CardDescription>
            {welcome
              ? "Your card is saved (€0 charged). Follow these steps for your first patch note."
              : `${completedCount}/${STEPS.length} steps done · finish one generation to unlock Share Studio.`}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss getting started"
          onClick={() => {
            dismissOnboarding();
            setDismissed(true);
          }}
        >
          <X />
        </Button>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => {
            const done = stepComplete(step.id, hasGenerated);
            const Icon = step.icon;
            const content = (
              <>
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {done ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>
                <span className="min-w-0 space-y-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    {step.label}
                    {!done ? (
                      <Circle className="size-3 text-muted-foreground/50" />
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </>
            );

            if (step.href && done) {
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className="flex gap-3 rounded-xl border border-white/10 bg-background/40 p-3 transition-colors hover:border-primary/30"
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={step.id}
                className="flex gap-3 rounded-xl border border-white/10 bg-background/40 p-3"
              >
                {content}
              </li>
            );
          })}
        </ol>

        {variant === "dashboard" ? (
          <Button asChild className="mt-4" size="sm">
            <Link href="/dashboard/generate">
              <Wand2 />
              Open generator
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function WelcomeBanner({
  hasGenerated,
  onDismiss,
}: {
  hasGenerated: boolean;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          Trial unlocked — {hasGenerated ? "nice work on your first generation!" : "ready for your first patch note."}
        </p>
        <p className="text-muted-foreground">
          {hasGenerated
            ? "Scroll to Share Studio to edit platform drafts, then copy where you publish."
            : "Import commits on the left, pick a tone, then Generate."}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
        Got it
      </Button>
    </div>
  );
}
