"use client";

import { useEffect } from "react";

import { mergeOnboardingProgress } from "@/lib/onboarding-progress";

type OnboardingProgressSeederProps = {
  hasGenerated: boolean;
};

export function OnboardingProgressSeeder({
  hasGenerated,
}: OnboardingProgressSeederProps) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      mergeOnboardingProgress({ hasGenerated });
    });
    return () => cancelAnimationFrame(frame);
  }, [hasGenerated]);

  return null;
}
