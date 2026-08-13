export type OnboardingStepId = "import" | "generate" | "share" | "history";

export type OnboardingProgress = Record<OnboardingStepId, boolean>;

const PROGRESS_KEY = "easy-patch-onboarding-progress-v2";
const DISMISSED_KEY = "easy-patch-onboarding-v2";

export const EMPTY_ONBOARDING_PROGRESS: OnboardingProgress = {
  import: false,
  generate: false,
  share: false,
  history: false,
};

export function readOnboardingProgress(): OnboardingProgress {
  if (typeof window === "undefined") return { ...EMPTY_ONBOARDING_PROGRESS };

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...EMPTY_ONBOARDING_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<OnboardingProgress>;
    return {
      import: Boolean(parsed.import),
      generate: Boolean(parsed.generate),
      share: Boolean(parsed.share),
      history: Boolean(parsed.history),
    };
  } catch {
    return { ...EMPTY_ONBOARDING_PROGRESS };
  }
}

export function writeOnboardingProgress(progress: OnboardingProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function markOnboardingStep(step: OnboardingStepId): OnboardingProgress {
  const current = readOnboardingProgress();
  if (current[step]) return current;
  const next = { ...current, [step]: true };
  writeOnboardingProgress(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("easy-patch-onboarding-progress"));
  }
  return next;
}

export function onboardingStepsComplete(progress: OnboardingProgress): boolean {
  return (
    progress.import &&
    progress.generate &&
    progress.share &&
    progress.history
  );
}

export function completedOnboardingCount(progress: OnboardingProgress): number {
  return (Object.keys(progress) as OnboardingStepId[]).filter(
    (key) => progress[key],
  ).length;
}

export function isOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DISMISSED_KEY) === "done";
}

export function dismissOnboardingGuide() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISSED_KEY, "done");
}

/** Seed server-known steps (e.g. user already generated before this release). */
export function mergeOnboardingProgress(input: {
  hasGenerated?: boolean;
  visitedHistory?: boolean;
}): OnboardingProgress {
  const current = readOnboardingProgress();
  const next: OnboardingProgress = { ...current };

  if (input.hasGenerated) {
    next.import = true;
    next.generate = true;
  }
  if (input.visitedHistory) {
    next.history = true;
  }

  if (
    next.import !== current.import ||
    next.generate !== current.generate ||
    next.history !== current.history
  ) {
    writeOnboardingProgress(next);
  }

  return next;
}
