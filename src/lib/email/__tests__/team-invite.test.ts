import { describe, expect, it } from "vitest";

import { teamInviteEmail } from "@/lib/email/templates";

describe("teamInviteEmail", () => {
  it("includes owner and invitee emails", () => {
    const { subject, html } = teamInviteEmail({
      ownerEmail: "owner@studio.com",
      inviteeEmail: "dev@studio.com",
    });

    expect(subject).toContain("Pro team");
    expect(html).toContain("owner@studio.com");
    expect(html).toContain("dev@studio.com");
    expect(html).toContain("/login");
  });
});
