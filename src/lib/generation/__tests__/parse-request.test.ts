import { describe, expect, it } from "vitest";

import { parseGenerationRequest } from "@/lib/generation/parse-request";

describe("parseGenerationRequest", () => {
  it("accepts valid payload", () => {
    const result = parseGenerationRequest({
      commits: "feat: add login",
      tone: "technical",
      repoFullName: "org/repo",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.commits).toBe("feat: add login");
      expect(result.data.tone).toBe("technical");
      expect(result.data.repoFullName).toBe("org/repo");
    }
  });

  it("rejects missing commits", () => {
    const result = parseGenerationRequest({ tone: "technical" });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid tone", () => {
    const result = parseGenerationRequest({
      commits: "fix: bug",
      tone: "invalid",
    });
    expect(result.ok).toBe(false);
  });
});
