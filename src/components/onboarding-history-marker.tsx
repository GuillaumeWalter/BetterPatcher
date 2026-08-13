"use client";

import { useEffect } from "react";

import { markOnboardingStep } from "@/lib/onboarding-progress";

/** Marks the history onboarding step when the user opens the history page. */
export function OnboardingHistoryMarker() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      markOnboardingStep("history");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
