import { describe, expect, it } from "vitest";

import {
  filterImportedCommits,
  isNoiseCommitSubject,
  messagesForGenerator,
} from "@/lib/commit-messages";

describe("commit-messages", () => {
  it("filters merge commits", () => {
    const filtered = filterImportedCommits([
      { sha: "a", message: "Merge pull request #1", date: "2026-01-01" },
      { sha: "b", message: "feat: ship", date: "2026-01-02" },
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].message).toBe("feat: ship");
  });

  it("dedupes identical subjects for generator", () => {
    const text = messagesForGenerator([
      "feat: ship",
      "feat: ship",
      "fix: bug",
    ]);

    expect(text.split("\n")).toHaveLength(2);
  });

  it("detects noise subjects", () => {
    expect(isNoiseCommitSubject("Merge branch 'main'")).toBe(true);
    expect(isNoiseCommitSubject("feat: ok")).toBe(false);
  });
});
