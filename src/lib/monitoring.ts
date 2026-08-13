type CaptureContext = Record<string, unknown>;

export function captureException(error: unknown, context?: CaptureContext) {
  if (process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    });
    return;
  }

  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  console.error("[captureException]", payload);
}
