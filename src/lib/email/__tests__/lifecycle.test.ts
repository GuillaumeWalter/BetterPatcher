import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  maybeSendPaidPlanLifecycleEmails,
  maybeSendTrialLifecycleEmails,
} from "@/lib/email";

vi.mock("@/lib/email/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/email/client")>();
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue(true),
    isEmailConfigured: vi.fn().mockReturnValue(true),
  };
});

import { sendEmail } from "@/lib/email/client";

const mockedSend = vi.mocked(sendEmail);

describe("lifecycle email triggers", () => {
  beforeEach(() => {
    mockedSend.mockClear();
  });

  it("sends trial low when one generation remains", async () => {
    await maybeSendTrialLifecycleEmails({
      userId: "u1",
      email: "a@example.com",
      plan: "trial",
      generationsRemaining: 1,
    });

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend.mock.calls[0][0].subject).toContain("1 free generation");
  });

  it("sends upgrade offer at 80% solo usage", async () => {
    await maybeSendPaidPlanLifecycleEmails({
      userId: "u1",
      email: "a@example.com",
      plan: "solo",
      generationsUsed: 20,
      generationsLimit: 25,
      generationsRemaining: 5,
      billingPeriodStart: "2026-08-01T00:00:00.000Z",
    });

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend.mock.calls[0][0].subject).toContain("Pro");
  });

  it("sends solo quota exhausted when remaining is zero", async () => {
    await maybeSendPaidPlanLifecycleEmails({
      userId: "u1",
      email: "a@example.com",
      plan: "solo",
      generationsUsed: 25,
      generationsLimit: 25,
      generationsRemaining: 0,
      billingPeriodStart: "2026-08-01T00:00:00.000Z",
    });

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend.mock.calls[0][0].subject.toLowerCase()).toContain(
      "quota",
    );
  });
});
