export type Tone = "technical" | "marketing" | "gaming";

export const TONE_OPTIONS: {
  value: Tone;
  label: string;
  description: string;
}[] = [
  {
    value: "technical",
    label: "Technical",
    description: "Classic changelog for engineers",
  },
  {
    value: "marketing",
    label: "Marketing / Startup",
    description: "Customer benefits, product language",
  },
  {
    value: "gaming",
    label: "Gaming / Devlog",
    description: "Friendly community update for players",
  },
];

/** Voice / mood layered on top of the format tone. */
export type Voice =
  | "straight"
  | "storytelling"
  | "playful"
  | "warm"
  | "punchy"
  | "apologetic";

export const VOICE_OPTIONS: {
  value: Voice;
  label: string;
  description: string;
}[] = [
  {
    value: "straight",
    label: "Straight",
    description: "Neutral and clear (default)",
  },
  {
    value: "storytelling",
    label: "Storytelling",
    description: "Light narrative framing around the changes",
  },
  {
    value: "playful",
    label: "Playful",
    description: "Witty / funny, still accurate",
  },
  {
    value: "warm",
    label: "Warm",
    description: "Friendly and upbeat",
  },
  {
    value: "punchy",
    label: "Punchy",
    description: "Short, energetic, high signal",
  },
  {
    value: "apologetic",
    label: "Apologetic",
    description: "Good for fix-heavy or incident updates",
  },
];

export const DEFAULT_VOICE: Voice = "straight";

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

export function parseVoice(value: unknown): Voice {
  if (typeof value !== "string") return DEFAULT_VOICE;
  const match = VOICE_OPTIONS.find((option) => option.value === value);
  return match?.value ?? DEFAULT_VOICE;
}
