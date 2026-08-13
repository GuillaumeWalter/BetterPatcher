import { describe, expect, it } from "vitest";

import {
  completedOnboardingCount,
  EMPTY_ONBOARDING_PROGRESS,
  onboardingStepsComplete,
} from "@/lib/onboarding-progress";

describe("onboarding progress helpers", () => {
  it("counts completed steps", () => {
    expect(completedOnboardingCount(EMPTY_ONBOARDING_PROGRESS)).toBe(0);
    expect(
      completedOnboardingCount({
        import: true,
        generate: true,
        share: false,
        history: false,
      }),
    ).toBe(2);
  });

  it("requires all four steps to be complete", () => {
    expect(onboardingStepsComplete(EMPTY_ONBOARDING_PROGRESS)).toBe(false);
    expect(
      onboardingStepsComplete({
        import: true,
        generate: true,
        share: true,
        history: true,
      }),
    ).toBe(true);
  });
});
