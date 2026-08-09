import { z } from "zod";

import { SHARE_PLATFORMS } from "@/lib/share/platforms";

export const platformDraftSchema = z.object({
  platform: z.enum(SHARE_PLATFORMS),
  title: z
    .string()
    .describe(
      "Optional title. Required for Steam (event title). Empty string for other platforms when unused.",
    ),
  body: z.string().describe("Full post body for this platform."),
});

export const generationSchema = z.object({
  markdown: z
    .string()
    .describe(
      "Patch note formatted in Markdown: title, sections (Features, Fixes, etc.), bullet lists.",
    ),
  socialPost: z
    .string()
    .describe(
      "Primary social post (fallback / history preview): hook, key points, CTA when relevant.",
    ),
  platformDrafts: z
    .array(platformDraftSchema)
    .describe(
      "One draft per platform requested in the system prompt. Match platform enum values exactly.",
    ),
});

export const singlePlatformDraftSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type GenerationResult = z.infer<typeof generationSchema>;
export type PlatformDraftResult = z.infer<typeof platformDraftSchema>;
