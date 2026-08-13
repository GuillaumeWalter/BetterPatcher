/** Shared rate-limit windows and caps (see supabase/rate_limits.sql). */
export const RATE_LIMITS = {
  /** Landing demo generations per IP per hour. */
  DEMO_PER_IP_HOUR: 3,
  DEMO_WINDOW_MS: 60 * 60 * 1000,

  /** AI draft regenerations per signed-in user per hour (each platform = 1). */
  REGENERATE_PER_USER_HOUR: 40,
  REGENERATE_WINDOW_MS: 60 * 60 * 1000,
} as const;
