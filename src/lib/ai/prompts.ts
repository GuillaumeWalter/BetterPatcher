import type { GenerationOptions, Tone } from "@/lib/constants";
import {
  defaultPlatformsForTone,
  getPlatformWritingRules,
  type SharePlatform,
} from "@/lib/share/platforms";

const BASE_RULES = `You are Easy Patch, an expert assistant for writing release notes.
Shared rules:
- Analyze raw commit messages (Conventional Commits, freeform messages, mixed languages).
- Group and deduplicate similar changes; ignore noise (merge commits, "wip", commit typos).
- Detect the dominant language of the commits and write all outputs in that language.
- Never invent a feature that is not present in the commits.
- Write readable, structured patch notes that are pleasant to scan (not a raw dump of commits).
- Reply only via the requested structured schema (markdown + socialPost + platformDrafts).`;

const TONE_PROMPTS: Record<Tone, string> = {
  technical: `Tone: TECHNICAL (for Alex, lead engineer).

For "markdown":
- Professional changelog format in Markdown.
- Structure: version title (e.g. "## vX.Y.Z" or "## Release Notes"), then ### Added, ### Changed, ### Fixed, ### Removed sections as content warrants.
- Factual, concise, developer oriented. Keep technical terms and module names.
- Short bullets, one idea per bullet. Group related commits.

For "socialPost":
- Short Slack engineering message: 2 to 4 lines, professional and direct.`,

  marketing: `Tone: MARKETING / STARTUP (for Sarah, product marketer).

For "markdown":
- Translate technical jargon into user or customer benefits.
- Structure: catchy title, executive summary, then theme sections (e.g. "What gets better for you", "Important fixes").
- Positive, clear, value oriented (without over promising).

For "socialPost":
- Ready to publish LinkedIn post: hook on the first line, 3 to 5 bullet points, soft CTA.
- Length: 800 characters max, spaced with line breaks.`,

  gaming: `Tone: GAMING / DEVLOG (for Lucas, indie studio).

For "markdown":
- Community patch note / devlog format (Steam, Discord, itch.io).
- Structure: epic or fun title, community intro, sections (New, Balance, Fixes, Quality of life).
- Engaging, accessible, lightly narrative (without being cringe).

For "socialPost":
- Discord or X gaming announcement: moderate hype, highlights, invite feedback.`,
};

function buildOptionsBlock(options: GenerationOptions): string {
  const lines: string[] = ["Formatting options enabled:"];

  if (options.summary) {
    lines.push(
      "- Intro summary: add 2 to 3 synthesis sentences right after the title (markdown).",
    );
  } else {
    lines.push("- No intro summary: go straight to the sections.");
  }

  if (options.highlights) {
    lines.push(
      "- Highlights: add a ### Highlights section (or equivalent) with 2 to 4 major changes as bullets.",
    );
  }

  if (options.emojis) {
    lines.push(
      "- Emojis: use relevant emojis sparingly for section titles (🚀 ✨ 🐛 ⚡ 🎮), key bullets, and social drafts. Do not put an emoji on every word.",
    );
  } else {
    lines.push("- No emojis in the markdown or social drafts.");
  }

  if (options.hashtags) {
    lines.push(
      "- Hashtags: where the platform allows them, end with 3 to 5 relevant hashtags. Skip hashtags on Slack and Steam.",
    );
  } else {
    lines.push("- No hashtags on social drafts (unless Instagram rules require a small niche set).");
  }

  return lines.join("\n");
}

function buildPlatformDraftsBlock(platforms: SharePlatform[]): string {
  const list = platforms.join(", ");
  return `For "platformDrafts":
- Produce exactly one object per platform in this list: ${list}.
- Adapt length, structure, and CTA to each platform (do not paste the same text everywhere).
- Use empty string for title except Steam (and any platform that needs a title).
- socialPost should match the primary social voice for this tone; platformDrafts go deeper per channel.

Platform rules:
${getPlatformWritingRules(platforms)}`;
}

export function getSystemPrompt(
  tone: Tone,
  options: GenerationOptions,
  platforms: SharePlatform[] = defaultPlatformsForTone(tone),
): string {
  return `${BASE_RULES}

${TONE_PROMPTS[tone]}

${buildOptionsBlock(options)}

${buildPlatformDraftsBlock(platforms)}`;
}

export function getPlatformRegeneratePrompt(
  tone: Tone,
  platform: SharePlatform,
  options: GenerationOptions,
): string {
  return `You are Easy Patch. Rewrite a social draft for one platform from an existing patch note.
Tone: ${tone}.
Output language: same as the patch note.
Never invent features absent from the patch note.
${buildOptionsBlock(options)}

Target platform rules:
${getPlatformWritingRules([platform])}

Return only the structured title + body for this platform.`;
}
