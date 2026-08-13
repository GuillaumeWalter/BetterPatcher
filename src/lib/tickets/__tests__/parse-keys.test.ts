import { describe, expect, it } from "vitest";

import { parseTicketKeys } from "@/lib/tickets/parse-keys";

describe("parseTicketKeys", () => {
  it("extracts unique issue keys from commits", () => {
    const keys = parseTicketKeys(
      "fix(ENG-42): login\nfeat(PROJ-9): dashboard\nrefs ENG-42",
    );
    expect(keys).toEqual(["ENG-42", "PROJ-9"]);
  });

  it("returns empty for text without keys", () => {
    expect(parseTicketKeys("chore: bump deps")).toEqual([]);
  });
});
