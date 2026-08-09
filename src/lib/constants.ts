export type Tone = "technical" | "marketing" | "gaming";

export const TONE_OPTIONS: {
  value: Tone;
  label: string;
  description: string;
}[] = [
  {
    value: "technical",
    label: "Technical",
    description: "Clear Markdown changelog for engineers",
  },
  {
    value: "marketing",
    label: "Marketing / Startup",
    description: "Customer benefits and product language",
  },
  {
    value: "gaming",
    label: "Gaming / Devlog",
    description: "Community tone for Steam & Discord (no fake host name)",
  },
];

export type GenerationOptions = {
  emojis: boolean;
  summary: boolean;
  hashtags: boolean;
  highlights: boolean;
};

export const DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  emojis: false,
  summary: false,
  hashtags: false,
  highlights: true,
};

export const GENERATION_OPTION_DEFS: {
  key: keyof GenerationOptions;
  label: string;
  description: string;
}[] = [
  {
    key: "emojis",
    label: "Emojis",
    description: "More visual titles and bullets (✨ 🐛 🚀)",
  },
  {
    key: "summary",
    label: "Intro summary",
    description: "1 to 2 factual sentences under the title",
  },
  {
    key: "highlights",
    label: "Highlights",
    description: "Short Highlights block only for clear standouts",
  },
  {
    key: "hashtags",
    label: "Hashtags",
    description: "3 to 5 relevant hashtags on the social post",
  },
];

export function parseGenerationOptions(value: unknown): GenerationOptions {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_GENERATION_OPTIONS;
  }

  const input = value as Record<string, unknown>;

  return {
    emojis: input.emojis === true,
    summary: input.summary !== false,
    hashtags: input.hashtags === true,
    highlights: input.highlights !== false,
  };
}
