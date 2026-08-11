import { getAppBaseUrl } from "@/lib/stripe";

const RESEND_API = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  /** Resend idempotency / dedup key */
  idempotencyKey?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Easy Patch <onboarding@resend.dev>"
  );
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !input.to) return false;

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (input.idempotencyKey) {
      headers["Idempotency-Key"] = input.idempotencyKey;
    }

    const response = await fetch(RESEND_API, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      console.error("[sendEmail]", input.subject, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[sendEmail]", input.subject, error);
    return false;
  }
}

export function appUrl(path = ""): string {
  const base = getAppBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
