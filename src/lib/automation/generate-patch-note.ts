import { getAiProvider } from "@/lib/ai/model";
import { runGeneration } from "@/lib/generation/run-generation";
import type { Tone } from "@/lib/constants";
import type { GenerationOptions } from "@/lib/constants";
import type { UserBillingProfile } from "@/lib/billing/constants";
import { savePatchNote } from "@/lib/supabase/patch-notes";
import { replacePlatformDrafts } from "@/lib/supabase/platform-drafts";
import {
  consumeGeneration,
  refundGeneration,
} from "@/lib/supabase/users";

export type AutomationGenerateResult =
  | {
      ok: true;
      savedId: string;
      markdown: string;
      socialPost: string;
      generationsRemaining: number;
    }
  | { ok: false; code: string; error: string };

export async function generatePatchNoteForUser(input: {
  profile: UserBillingProfile;
  commits: string;
  tone: Tone;
  options: GenerationOptions;
  repoFullName?: string | null;
  referencePatch?: string;
}): Promise<AutomationGenerateResult> {
  if (!getAiProvider()) {
    return {
      ok: false,
      code: "ai_not_configured",
      error: "AI is not configured on the server.",
    };
  }

  const consumed = await consumeGeneration(input.profile.userId);
  if (!consumed.ok) {
    return {
      ok: false,
      code: consumed.code ?? "quota_exceeded",
      error: "Generation quota exceeded or trial not active.",
    };
  }

  try {
    const output = await runGeneration({
      commits: input.commits,
      tone: input.tone,
      options: input.options,
      referencePatch: input.referencePatch,
    });

    if (!output?.markdown?.trim()) {
      throw new Error("Empty generation.");
    }

    const savedId = await savePatchNote({
      userId: input.profile.userId,
      userEmail: input.profile.email,
      tone: input.tone,
      commitsRaw: input.commits,
      markdown: output.markdown,
      socialPost: output.socialPost,
      repoFullName: input.repoFullName ?? null,
    });

    if (!savedId) {
      throw new Error("Could not save patch note.");
    }

    if (output.platformDrafts.length > 0) {
      await replacePlatformDrafts(savedId, output.platformDrafts);
    }

    return {
      ok: true,
      savedId,
      markdown: output.markdown,
      socialPost: output.socialPost,
      generationsRemaining: consumed.generationsRemaining,
    };
  } catch (error) {
    await refundGeneration(input.profile.userId, consumed.plan);
    console.error("[generatePatchNoteForUser]", error);
    return {
      ok: false,
      code: "generation_failed",
      error: "Generation failed. Please try again.",
    };
  }
}
