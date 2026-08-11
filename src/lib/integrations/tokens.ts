import { createHmac, timingSafeEqual } from "node:crypto";

import { getAuthSecret } from "@/lib/env";

export function signIntegrationToken(userId: string): string | null {
  const secret = getAuthSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(userId).digest("hex");
}

export function verifyIntegrationToken(
  userId: string,
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  const expected = signIntegrationToken(userId);
  if (!expected) return false;

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(token, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature?.startsWith("sha256=")) return false;

  const expected =
    "sha256=" +
    createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
