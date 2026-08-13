"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import {
  completedOnboardingCount,
  dismissOnboardingGuide,
  isOnboardingDismissed,
  mergeOnboardingProgress,
  type OnboardingProgress,
  type OnboardingStepId,
  onboardingStepsComplete,
  readOnboardingProgress,
} from "@/lib/onboarding-progress";

type GuidedOnboardingProps = {
  welcome?: boolean;
  hasGenerated: boolean;
  variant?: "dashboard" | "generate";
};

const STEPS: Array<{
  id: OnboardingStepId;
  label: string;
  description: string;
  icon: typeof Wand2;
  href?: string;
}> = [
  {
    id: "import",
    label: "Import commits",
    description: "GitHub, GitLab, paste, or Load sample commits.",
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
    description: "Copy or edit a platform draft (Discord, Steam, X…).",
    icon: Share2,
  },
  {
    id: "history",
    label: "Open history",
    description: "Find saved patch notes and reopen Share Studio.",
    icon: History,
    href: "/dashboard/history",
  },
];

export function GuidedOnboarding({
  welcome = false,
  hasGenerated,
  variant = "generate",
}: GuidedOnboardingProps) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress>(() =>
    readOnboardingProgress(),
  );

  const refreshProgress = useCallback(() => {
    setProgress(readOnboardingProgress());
    setDismissed(isOnboardingDismissed());
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      mergeOnboardingProgress({ hasGenerated });
      refreshProgress();
    });
    return () => cancelAnimationFrame(frame);
  }, [hasGenerated, refreshProgress]);

  useEffect(() => {
    const onProgress = () => refreshProgress();
    window.addEventListener("easy-patch-onboarding-progress", onProgress);
    return () => {
      window.removeEventListener("easy-patch-onboarding-progress", onProgress);
    };
  }, [refreshProgress]);

  useEffect(() => {
    if (!mounted || dismissed || !onboardingStepsComplete(progress)) return;
    const frame = requestAnimationFrame(() => {
      dismissOnboardingGuide();
      setDismissed(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [progress, mounted, dismissed]);

  if (!mounted) return null;

  if (dismissed) {
    if (!welcome) return null;

    return (
      <WelcomeBanner
        progress={progress}
        onDismiss={() => {
          dismissOnboardingGuide();
          setDismissed(true);
        }}
      />
    );
  }

  const completedCount = completedOnboardingCount(progress);

  if (variant === "dashboard" && onboardingStepsComplete(progress)) {
    return null;
  }

  const nextStep = STEPS.find((step) => !progress[step.id]);

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
              : `${completedCount}/${STEPS.length} steps done${
                  nextStep ? ` · next: ${nextStep.label.toLowerCase()}` : ""
                }.`}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss getting started"
          onClick={() => {
            dismissOnboardingGuide();
            setDismissed(true);
          }}
        >
          <X />
        </Button>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => {
            const done = progress[step.id];
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

            if (step.href) {
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={`flex gap-3 rounded-xl border p-3 transition-colors ${
                      done
                        ? "border-white/10 bg-background/40 hover:border-primary/30"
                        : "border-primary/25 bg-primary/5 hover:border-primary/40"
                    }`}
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={step.id}
                className={`flex gap-3 rounded-xl border p-3 ${
                  done
                    ? "border-white/10 bg-background/40"
                    : "border-primary/25 bg-primary/5"
                }`}
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
  progress,
  onDismiss,
}: {
  progress: OnboardingProgress;
  onDismiss: () => void;
}) {
  const next = STEPS.find((step) => !progress[step.id]);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          Trial unlocked —{" "}
          {progress.generate
            ? "nice work on your first generation!"
            : "ready for your first patch note."}
        </p>
        <p className="text-muted-foreground">
          {next
            ? `Next step: ${next.label.toLowerCase()}.`
            : "All quick-start steps complete."}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
        Got it
      </Button>
    </div>
  );
}
