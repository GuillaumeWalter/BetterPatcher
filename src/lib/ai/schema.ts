import { z } from "zod";

export const generationSchema = z.object({
  markdown: z
    .string()
    .describe(
      "Patch note formatted in Markdown: title, sections (Features, Fixes, etc.), bullet lists.",
    ),
  socialPost: z
    .string()
    .describe(
      "Short LinkedIn or X post: hook, key points, CTA or emoji when relevant.",
    ),
});

export type GenerationResult = z.infer<typeof generationSchema>;
