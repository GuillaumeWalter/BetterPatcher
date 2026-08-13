import { auth } from "@/auth";
import { signIntegrationToken } from "@/lib/integrations/tokens";
import { getAppBaseUrl } from "@/lib/stripe";
import { getUserProfile, updateUserIntegrations } from "@/lib/supabase/users";

const DISCORD_WEBHOOK_PATTERN =
  /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.id);
  const token = signIntegrationToken(session.user.id);
  const baseUrl = getAppBaseUrl();

  return Response.json({
    releaseAutoRepo: profile?.releaseAutoRepo ?? null,
    discordWebhookUrl: profile?.discordWebhookUrl ?? null,
    hasDiscordWebhook: Boolean(profile?.discordWebhookUrl),
    releaseWebhookUrl: token
      ? `${baseUrl}/api/webhooks/github/release?userId=${encodeURIComponent(session.user.id)}&token=${token}`
      : null,
    actionGenerateUrl: token ? `${baseUrl}/api/action/generate` : null,
    actionAuthHint: token
      ? `EasyPatch ${session.user.id}:${token}`
      : null,
  });
}

export async function PATCH(request: Request) {
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

  const releaseAutoRepo =
    typeof body === "object" &&
    body !== null &&
    "releaseAutoRepo" in body &&
    typeof body.releaseAutoRepo === "string"
      ? body.releaseAutoRepo.trim() || null
      : undefined;

  const discordWebhookUrl =
    typeof body === "object" &&
    body !== null &&
    "discordWebhookUrl" in body &&
    typeof body.discordWebhookUrl === "string"
      ? body.discordWebhookUrl.trim() || null
      : undefined;

  if (
    discordWebhookUrl &&
    !DISCORD_WEBHOOK_PATTERN.test(discordWebhookUrl)
  ) {
    return Response.json(
      { error: "Invalid Discord webhook URL." },
      { status: 400 },
    );
  }

  const ok = await updateUserIntegrations(session.user.id, {
    releaseAutoRepo,
    discordWebhookUrl,
  });

  if (!ok) {
    return Response.json(
      { error: "Could not save integrations." },
      { status: 500 },
    );
  }

  return Response.json({ success: true });
}
