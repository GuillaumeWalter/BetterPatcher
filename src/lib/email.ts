const RESEND_API = "https://api.resend.com/emails";

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendWelcomeEmail(input: {
  to: string;
  name?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Easy Patch <onboarding@resend.dev>";

  if (!apiKey || !input.to) return;

  const greeting = input.name ? `Hi ${input.name},` : "Hi,";

  try {
    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: "Welcome to Easy Patch",
        html: `
          <p>${greeting}</p>
          <p>Your account is ready. Verify your card (€0) to unlock free generations, then turn commits into patch notes in seconds.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://easypatch.app"}/onboarding">Activate your trial</a></p>
          <p>— Easy Patch</p>
        `,
      }),
    });

    if (!response.ok) {
      console.error("[sendWelcomeEmail]", await response.text());
    }
  } catch (error) {
    console.error("[sendWelcomeEmail]", error);
  }
}

export function isEmailConfigured() {
  return resendConfigured();
}
