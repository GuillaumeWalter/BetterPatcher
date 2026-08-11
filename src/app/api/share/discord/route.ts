import { auth } from "@/auth";
import { getUserProfile } from "@/lib/supabase/users";

const DISCORD_WEBHOOK_PATTERN =
  /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content =
    typeof body === "object" &&
    body !== null &&
    "content" in body &&
    typeof body.content === "string"
      ? body.content.trim()
      : "";

  if (!content) {
    return Response.json({ error: "Content is required." }, { status: 400 });
  }

  if (content.length > 2000) {
    return Response.json(
      { error: "Discord messages are limited to 2000 characters." },
      { status: 400 },
    );
  }

  const profile = await getUserProfile(session.user.id);
  const webhookUrl = profile?.discordWebhookUrl;

  if (!webhookUrl || !DISCORD_WEBHOOK_PATTERN.test(webhookUrl)) {
    return Response.json(
      {
        error:
          "Add a Discord webhook in Settings before publishing.",
      },
      { status: 400 },
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[discord/publish]", response.status, text);
    return Response.json(
      { error: "Discord rejected the message. Check your webhook URL." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
