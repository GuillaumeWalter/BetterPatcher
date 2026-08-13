import { describe, expect, it } from "vitest";

import { validateDiscordContent } from "@/lib/share/publish-discord";

describe("validateDiscordContent", () => {
  it("rejects empty content", () => {
    expect(validateDiscordContent("")).toBe("Content is required.");
  });

  it("rejects over 2000 chars", () => {
    expect(validateDiscordContent("a".repeat(2001))).toContain("2000");
  });

  it("accepts valid content", () => {
    expect(validateDiscordContent("Ship day 🚀")).toBeNull();
  });
});
