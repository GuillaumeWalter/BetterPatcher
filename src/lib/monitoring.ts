type CaptureContext = Record<string, unknown>;

/** Logs errors server-side. Set SENTRY_DSN and wire @sentry/nextjs when ready. */
export function captureException(error: unknown, context?: CaptureContext) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  console.error("[captureException]", payload);

  if (process.env.SENTRY_DSN?.trim()) {
    console.error("[captureException] SENTRY_DSN is set — add @sentry/nextjs to forward events.");
  }
}
