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
