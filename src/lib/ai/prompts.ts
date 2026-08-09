import type { GenerationOptions, Tone } from "@/lib/constants";

const BASE_RULES = `You are Easy Patch, an expert assistant for writing release notes.
Shared rules:
- Analyze raw commit messages (Conventional Commits, freeform messages, mixed languages). Prefer the subject line; use multi-line bodies only when they add real detail.
- Group and deduplicate similar changes; ignore noise (merge commits, "wip", "tmp", pure formatting/typo commits unless they fix a user-visible bug).
- Detect the dominant language of the commits and write both outputs in that language.
- Never invent a feature, fix, or breaking change that is not present in the commits.
- Prefer user-facing outcomes over internal refactors unless the tone is technical.
- Write readable, structured patch notes that are pleasant to scan (not a raw dump of commits).
- Reply only via the requested structured schema (markdown + socialPost).`;

const TONE_PROMPTS: Record<Tone, string> = {
  technical: `Tone: TECHNICAL (for Alex, lead engineer).

For "markdown":
- Professional changelog format in Markdown.
- Structure: version title (e.g. "## vX.Y.Z" or "## Release Notes"), then ### Added, ### Changed, ### Fixed, ### Removed sections as content warrants. Omit empty sections.
- Factual, concise, developer oriented. Keep technical terms and module names.
- Short bullets, one idea per bullet. Group related commits.

For "socialPost":
- Short LinkedIn or X engineering update: 2 to 4 lines, professional and direct. No Slack-only slang.`,

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
- Community patch note / devlog format suitable for Steam News, Discord, or itch.io.
- Structure: epic or fun title, short community intro, then sections (New, Balance, Fixes, Quality of life) as content warrants.
- Engaging, accessible, lightly narrative (without being cringe). Call out player-facing changes first.

For "socialPost":
- Discord or X gaming announcement: moderate hype, 3 to 5 highlights, invite feedback.`,
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
      "- Emojis: use relevant emojis sparingly for section titles (🚀 ✨ 🐛 ⚡ 🎮), key bullets, and the social post. Do not put an emoji on every word.",
    );
  } else {
    lines.push("- No emojis in the markdown or the social post.");
  }

  if (options.hashtags) {
    lines.push(
      "- Hashtags: end socialPost with 3 to 5 relevant hashtags (#ProductUpdate, industry, tech…).",
    );
  } else {
    lines.push("- No hashtags on the social post.");
  }

  return lines.join("\n");
}

export function getSystemPrompt(
  tone: Tone,
  options: GenerationOptions,
): string {
  return `${BASE_RULES}

${TONE_PROMPTS[tone]}

${buildOptionsBlock(options)}`;
}

export function getUserPrompt(commits: string, tone: Tone): string {
  return `Turn the following commit messages into a ${tone} patch note.

Requirements:
- Deduplicate and group related changes.
- Ignore noise commits.
- Produce both markdown and socialPost per the system instructions.

Commits:
${commits}`;
}
