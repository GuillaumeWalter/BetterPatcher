import { z } from "zod";

export const generationSchema = z.object({
  markdown: z
    .string()
    .describe(
      "Patch note formaté en Markdown : titre, sections (Features, Fixes, etc.), listes à puces.",
    ),
  socialPost: z
    .string()
    .describe(
      "Post court pour LinkedIn ou X : accroche, points clés, CTA ou emoji si pertinent.",
    ),
});

export type GenerationResult = z.infer<typeof generationSchema>;
