import type { DeepPartial } from "ai";
import { generateText, Output, streamObject } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";
import { generationSchema, type GenerationResult } from "@/lib/ai/schema";
import type { GenerationOptions, Tone } from "@/lib/constants";
import { defaultPlatformsForTone } from "@/lib/share/platforms";
import { normalizePlatformDrafts } from "@/lib/share/normalize-drafts";

export type GenerationInput = {
  commits: string;
  tone: Tone;
  options: GenerationOptions;
  referencePatch?: string | null;
};

export async function runGeneration(
  input: GenerationInput,
): Promise<GenerationResult | null> {
  const platforms = defaultPlatformsForTone(input.tone);

  const { output } = await generateText({
    model: getGenerationModel(),
    system: getSystemPrompt(
      input.tone,
      input.options,
      platforms,
      input.referencePatch || null,
    ),
    prompt: getUserPrompt(
      input.commits,
      input.tone,
      input.referencePatch || null,
    ),
    output: Output.object({ schema: generationSchema }),
  });

  if (!output) return null;

  return {
    ...output,
    platformDrafts: normalizePlatformDrafts(output.platformDrafts, platforms),
  };
}

export function createGenerationStream(input: GenerationInput) {
  if (!getAiProvider()) {
    throw new Error("AI is not configured.");
  }

  const platforms = defaultPlatformsForTone(input.tone);

  return streamObject({
    model: getGenerationModel(),
    schema: generationSchema,
    system: getSystemPrompt(
      input.tone,
      input.options,
      platforms,
      input.referencePatch || null,
    ),
    prompt: getUserPrompt(
      input.commits,
      input.tone,
      input.referencePatch || null,
    ),
  });
}

export function normalizeGenerationOutput(
  output: DeepPartial<GenerationResult> | undefined,
  tone: Tone,
) {
  if (!output) return null;
  const platforms = defaultPlatformsForTone(tone);
  return {
    markdown: output.markdown ?? "",
    socialPost: output.socialPost ?? "",
    platformDrafts: normalizePlatformDrafts(
      output.platformDrafts as GenerationResult["platformDrafts"],
      platforms,
    ),
  };
}
