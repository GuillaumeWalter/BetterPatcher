import { describe, expect, it } from "vitest";

import {
  paymentFailedEmail,
  trialExhaustedEmail,
  welcomeEmail,
} from "@/lib/email/templates";

describe("email templates", () => {
  it("welcome includes CTA and trial count", () => {
    const { subject, html } = welcomeEmail("Alex");
    expect(subject).toContain("Welcome");
    expect(html).toContain("Alex");
    expect(html).toContain("/onboarding");
    expect(html).toContain("Activate my trial");
  });

  it("trial exhausted mentions Solo and Pro", () => {
    const { html } = trialExhaustedEmail("€4.99", "€9.99", null);
    expect(html).toContain("Solo");
    expect(html).toContain("Pro");
    expect(html).toContain("/dashboard/billing");
  });

  it("payment failed links to billing", () => {
    const { subject, html } = paymentFailedEmail();
    expect(subject.toLowerCase()).toContain("payment");
    expect(html).toContain("/dashboard/billing");
  });

  it("solo quota low mentions remaining count", async () => {
    const { soloQuotaLowEmail } = await import("@/lib/email/templates");
    const { subject } = soloQuotaLowEmail(3, 25, "Alex");
    expect(subject).toContain("3");
  });
});
