import * as Sentry from "@sentry/nextjs";
import { getSentryDsn } from "@/lib/env";

Sentry.init({
  dsn: getSentryDsn(),
  tracesSampleRate: 0.1,
  enabled: Boolean(getSentryDsn()),
});
