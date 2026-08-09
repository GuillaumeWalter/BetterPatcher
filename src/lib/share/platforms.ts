import type { Tone } from "@/lib/constants";

export const SHARE_PLATFORMS = [
  "discord",
  "x",
  "linkedin",
  "threads",
  "instagram",
  "facebook",
  "steam",
  "slack",
] as const;

export type SharePlatform = (typeof SHARE_PLATFORMS)[number];

export type PlatformDraft = {
  platform: SharePlatform;
  title: string;
  body: string;
};

export type PlatformMeta = {
  value: SharePlatform;
  label: string;
  description: string;
  needsTitle: boolean;
  mediaHint: string;
};

export const PLATFORM_OPTIONS: PlatformMeta[] = [
  {
    value: "discord",
    label: "Discord",
    description: "Markdown announcement for your community channel",
    needsTitle: false,
    mediaHint: "Image optional",
  },
  {
    value: "x",
    label: "X",
    description: "Short post or thread beats (link late if needed)",
    needsTitle: false,
    mediaHint: "Image optional",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    description: "Hook, bullets, soft CTA",
    needsTitle: false,
    mediaHint: "Image optional",
  },
  {
    value: "threads",
    label: "Threads",
    description: "Conversational update with one primary link",
    needsTitle: false,
    mediaHint: "Image or video optional",
  },
  {
    value: "instagram",
    label: "Instagram",
    description: "Long feed caption with a strong first line",
    needsTitle: false,
    mediaHint: "Image or Reel required to publish later",
  },
  {
    value: "facebook",
    label: "Facebook",
    description: "Page-friendly community post",
    needsTitle: false,
    mediaHint: "Image or video recommended",
  },
  {
    value: "steam",
    label: "Steam",
    description: "Patch notes ready to paste into Steamworks",
    needsTitle: true,
    mediaHint: "Add images in Steamworks",
  },
  {
    value: "slack",
    label: "Slack",
    description: "Short engineering update",
    needsTitle: false,
    mediaHint: "Rarely needs media",
  },
];

const DEFAULT_PLATFORMS_BY_TONE: Record<Tone, SharePlatform[]> = {
  technical: ["slack", "discord", "linkedin"],
  marketing: ["linkedin", "x", "threads", "facebook"],
  gaming: ["discord", "steam", "x", "instagram", "threads"],
};

export function defaultPlatformsForTone(tone: Tone): SharePlatform[] {
  return DEFAULT_PLATFORMS_BY_TONE[tone];
}

export function isSharePlatform(value: unknown): value is SharePlatform {
  return (
    typeof value === "string" &&
    (SHARE_PLATFORMS as readonly string[]).includes(value)
  );
}

export function platformLabel(platform: SharePlatform): string {
  return (
    PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ??
    platform
  );
}

/** Prompt block describing how to write for each platform. */
export function getPlatformWritingRules(platforms: SharePlatform[]): string {
  const rules: Record<SharePlatform, string> = {
    discord:
      "Discord: Markdown OK. Short intro + bullets or highlights. Soft community CTA. Aim under ~1800 characters.",
    x: "X: Punchy. Prefer a single post under 280 characters, or a short thread (hook + 2 to 4 beats separated by blank lines). At most 2 hashtags. Put any URL in the last beat when needed.",
    linkedin:
      "LinkedIn: Hook on line 1, 3 to 5 bullets, soft CTA. About 500 to 1300 characters with line breaks.",
    threads:
      "Threads: Conversational, 300 to 800 characters. One primary URL max for link preview. Avoid stacking many links.",
    instagram:
      "Instagram (feed): Long storytelling caption is OK. First ~125 characters must hook before the fold. Structure: hook, value paragraphs, one CTA, then 3 to 5 niche hashtags. Do not rely on outbound links in the caption (mention link in bio if needed).",
    facebook:
      "Facebook: Mid-length community post, clear benefit, optional question CTA. Link OK.",
    steam:
      "Steam News / Patch Notes: Fill title with a clear update title. Body: plain bullets for New / Balance / Fixes / QoL as content warrants (paste-ready for Steamworks). No hashtags.",
    slack:
      "Slack: 2 to 4 lines, professional and direct. What shipped and why it matters for the team.",
  };

  return platforms.map((platform) => `- ${rules[platform]}`).join("\n");
}

export function seedDraftsFromSocialPost(
  socialPost: string,
  tone: Tone,
): PlatformDraft[] {
  const body = socialPost.trim();
  if (!body) return [];

  return defaultPlatformsForTone(tone).map((platform) => ({
    platform,
    title: platform === "steam" ? "Update" : "",
    body,
  }));
}
