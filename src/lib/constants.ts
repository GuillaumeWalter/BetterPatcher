export type Tone = "technical" | "marketing" | "gaming";

export const TONE_OPTIONS: {
  value: Tone;
  label: string;
  description: string;
}[] = [
  {
    value: "technical",
    label: "Technique",
    description: "Changelog Markdown clair pour les devs",
  },
  {
    value: "marketing",
    label: "Marketing / Start-up",
    description: "Bénéfices clients et langage produit",
  },
  {
    value: "gaming",
    label: "Gaming / Devlog",
    description: "Ton engageant pour Steam & Discord",
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
  summary: true,
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
    description: "Titres et puces plus visuels (✨ 🐛 🚀)",
  },
  {
    key: "summary",
    label: "Résumé d'intro",
    description: "2–3 phrases de synthèse en ouverture",
  },
  {
    key: "highlights",
    label: "Points clés",
    description: "Bloc « Highlights » avec les changements majeurs",
  },
  {
    key: "hashtags",
    label: "Hashtags",
    description: "3–5 hashtags pertinents sur le post réseaux",
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
