import { describe, expect, it } from "vitest";

import { normalizePlatformDrafts } from "@/lib/share/normalize-drafts";

describe("normalizePlatformDrafts", () => {
  it("keeps expected platforms in order", () => {
    const drafts = normalizePlatformDrafts(
      [
        { platform: "x", body: "Post for X" },
        { platform: "linkedin", body: "Post for LinkedIn" },
      ],
      ["linkedin", "x", "discord"],
    );

    expect(drafts.map((d) => d.platform)).toEqual(["linkedin", "x"]);
  });

  it("drops empty bodies and unknown platforms", () => {
    const drafts = normalizePlatformDrafts(
      [
        { platform: "linkedin", body: "  " },
        { platform: "not-a-platform", body: "nope" },
      ],
      ["linkedin"],
    );

    expect(drafts).toHaveLength(0);
  });
});
