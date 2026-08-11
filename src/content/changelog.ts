export type ChangelogRelease = {
  version: string;
  date: string;
  items: string[];
};

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
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
