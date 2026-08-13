export type ChangelogRelease = {
  version: string;
  date: string;
  items: string[];
};

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: "0.6.1",
    date: "August 2026",
    items: [
      "Durable rate limits — demo IP + draft regeneration (Supabase rate_limits.sql)",
      "Onboarding tracks real steps (import → generate → share → history)",
      "Docs refresh: Todo.txt, open-questions.md aligned with shipped code",
    ],
  },
  {
    version: "0.6.0",
    date: "August 2026",
    items: [
      "Guided onboarding — 4-step quick start after trial activation",
      "Pro team shared history (view + copy teammates' patch notes)",
      "Share Studio — Regenerate all platform drafts in one click",
      "Generator — Load sample commits for instant first try",
      "Core product docs updated (roadmap, SCORE-10-10, ProjectContext)",
    ],
  },
  {
    version: "0.5.0",
    date: "August 2026",
    items: [
      "Linear OAuth — auto-enrich patch notes from ticket keys in commits",
      "Ticket preview panel in generator (Solo + Pro)",
      "Steamworks-oriented Steam draft rules in Share Studio",
    ],
  },
  {
    version: "0.4.1",
    date: "August 2026",
    items: [
      "Discord bot — slash /easypatch link + channel posting",
      "Dashboard setup checklist (env-check widget)",
      "Team invite email when Pro owner invites a teammate",
      "Docs: discord-bot.md + register-commands script",
    ],
  },
  {
    version: "0.4.0",
    date: "August 2026",
    items: [
      "GDPR account deletion (Settings → Delete account)",
      "Sentry error monitoring (@sentry/nextjs)",
      "Favorite GitHub repos in the generator",
      "Pro team seats — invite teammates by email",
      "Annual billing (−15%) on Solo & Pro",
      "PWA install prompt + web manifest",
    ],
  },
  {
    version: "0.3.0",
    date: "August 2026",
    items: [
      "Streaming AI generation (text appears live)",
      "Demo quota counter on landing (X/3 per hour)",
      "Pro plan quota emails",
      "GitHub Release webhook automation (Settings)",
      "Discord webhook publish from Share Studio",
      "Dashboard → Settings for integrations",
    ],
  },
  {
    version: "0.2.1",
    date: "August 2026",
    items: [
      "Open Graph previews and structured data for SEO",
      "Dashboard loading states and clearer billing errors",
      "Accessibility improvements (skip link, tabs, live regions)",
      "Legal templates expanded (cookies policy)",
      "More unit tests and Playwright smoke tests in CI",
    ],
  },
  {
    version: "0.2.0",
    date: "August 2026",
    items: [
      "Free demo generator on landing (no account)",
      "Share Studio — per-platform social drafts",
      "GitLab import + commit range picker",
      "Solo & Pro plans with geo pricing",
      "Transactional emails (welcome, trial, billing)",
      "FAQ, Contact, legal pages",
    ],
  },
  {
    version: "0.1.0",
    date: "July 2026",
    items: [
      "GitHub OAuth + commit import",
      "AI patch notes (technical, marketing, gaming)",
      "Stripe trial + subscriptions",
      "Patch note history",
    ],
  },
];
