import { readEnv } from "@/lib/env";

export function getCronSecret(): string | undefined {
  return readEnv("CRON_SECRET");
}

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
