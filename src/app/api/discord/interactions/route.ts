import {
  getBotInviteUrl,
  handleDiscordInteraction,
  verifyDiscordRequest,
} from "@/lib/discord/bot";
import { captureException } from "@/lib/monitoring";

export async function POST(request: Request) {
  try {
    const { ok, body } = await verifyDiscordRequest(request);

    if (!ok) {
      return new Response("Invalid request signature", { status: 401 });
    }

    return handleDiscordInteraction(body);
  } catch (error) {
    captureException(error, { route: "/api/discord/interactions" });
    return new Response("Interaction error", { status: 500 });
  }
}

export async function GET() {
  const inviteUrl = getBotInviteUrl();
  if (!inviteUrl) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, inviteUrl });
}
