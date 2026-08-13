import { describe, expect, it } from "vitest";

import { generateLinkCode } from "@/lib/discord/bot";

describe("generateLinkCode", () => {
  it("returns a 6-character uppercase alphanumeric code", () => {
    const code = generateLinkCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
    expect(code).not.toMatch(/[IO01]/); // excluded ambiguous chars in alphabet
  });
});
