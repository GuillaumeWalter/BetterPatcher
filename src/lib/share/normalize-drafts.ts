import type { PlatformDraftResult } from "@/lib/ai/schema";
import {
  isSharePlatform,
  type PlatformDraft,
  type SharePlatform,
} from "@/lib/share/platforms";

export function normalizePlatformDrafts(
  drafts: PlatformDraftResult[] | undefined,
  expected: SharePlatform[],
): PlatformDraft[] {
  const byPlatform = new Map<SharePlatform, PlatformDraft>();

  for (const draft of drafts ?? []) {
    if (!isSharePlatform(draft.platform)) continue;
    const body = draft.body?.trim();
    if (!body) continue;
    byPlatform.set(draft.platform, {
      platform: draft.platform,
      title: draft.title?.trim() ?? "",
      body,
    });
  }

  return expected
    .map((platform) => byPlatform.get(platform))
    .filter((draft): draft is PlatformDraft => Boolean(draft));
}
