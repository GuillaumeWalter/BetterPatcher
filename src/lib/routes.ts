/** Canonical app routes (authenticated product shell). */
export const APP = {
  home: "/app",
  generate: "/app/generate",
  history: "/app/history",
  historyItem: (id: string) => `/app/history/${id}` as const,
  billing: "/app/billing",
  settings: "/app/settings",
} as const;

/** Legacy `/dashboard` prefix kept for redirects and old links. */
export const LEGACY_DASHBOARD_PREFIX = "/dashboard";
