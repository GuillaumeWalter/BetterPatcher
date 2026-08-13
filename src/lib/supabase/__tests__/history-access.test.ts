import { describe, expect, it } from "vitest";

import { uniqueIds } from "@/lib/supabase/history-access";

describe("uniqueIds", () => {
  it("deduplicates and drops empty strings", () => {
    expect(uniqueIds(["a", "b", "a", "", "c", "b"])).toEqual(["a", "b", "c"]);
  });
});
