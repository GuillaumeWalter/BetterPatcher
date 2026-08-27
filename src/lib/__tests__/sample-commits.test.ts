import { describe, expect, it } from "vitest";

import {
  SAMPLE_COMMITS,
  SAMPLE_COMMITS_PLACEHOLDER,
} from "@/lib/sample-commits";

describe("sample commits", () => {
  it("provides multi-line sample and placeholder logs", () => {
    expect(SAMPLE_COMMITS.split("\n").length).toBeGreaterThanOrEqual(3);
    expect(SAMPLE_COMMITS_PLACEHOLDER).toContain("feat");
  });
});
