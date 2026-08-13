import { describe, expect, it } from "vitest";

import { buildQuotaSnapshot } from "@/lib/billing/constants";
import { checkRateLimit } from "@/lib/rate-limit";

describe("buildQuotaSnapshot", () => {
  const base = {
    userId: "u1",
    email: "a@b.com",
    stripeCustomerId: "cus_1",
    paymentMethodVerified: true,
    stripeSubscriptionId: "sub_1",
    trialGenerationsUsed: 0,
    trialGenerationsLimit: 5,
    periodGenerationsUsed: 2,
    periodGenerationsLimit: 25,
    billingPeriodStart: null,
    lastGenerationAt: null,
    githubAccessToken: null,
    releaseAutoRepo: null,
    discordWebhookUrl: null,
    workspaceOwnerId: null,
    favoriteRepos: [],
  };

  it("blocks generation when past_due", () => {
    const snapshot = buildQuotaSnapshot({
      ...base,
      subscriptionStatus: "past_due",
      planTier: "solo",
    });

    expect(snapshot.canGenerate).toBe(false);
    expect(snapshot.requiresSubscription).toBe(true);
    expect(snapshot.plan).toBe("solo");
  });

  it("allows trial generations", () => {
    const snapshot = buildQuotaSnapshot({
      ...base,
      subscriptionStatus: "none",
      planTier: "none",
      trialGenerationsUsed: 1,
    });

    expect(snapshot.plan).toBe("trial");
    expect(snapshot.canGenerate).toBe(true);
    expect(snapshot.generationsRemaining).toBe(4);
  });
});

describe("checkRateLimit", () => {
  it("allows up to the limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
    expect(checkRateLimit(key, 2, 60_000).remaining).toBe(0);
  });
});
