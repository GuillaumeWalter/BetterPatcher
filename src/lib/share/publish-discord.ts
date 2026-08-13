import { postDiscordBotMessage } from "@/lib/discord/bot";
import { getUserProfile } from "@/lib/supabase/users";

const DISCORD_WEBHOOK_PATTERN =
  /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

const MAX_DISCORD_LENGTH = 2000;

export function validateDiscordContent(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return "Content is required.";
  if (trimmed.length > MAX_DISCORD_LENGTH) {
    return "Discord messages are limited to 2000 characters.";
  }
  return null;
}

export async function publishDiscordForUser(
  userId: string,
  content: string,
): Promise<{ ok: true; via: "bot" | "webhook" } | { ok: false; error: string }> {
  const validation = validateDiscordContent(content);
  if (validation) {
    return { ok: false, error: validation };
  }

  const profile = await getUserProfile(userId);

  if (profile?.discordChannelId) {
    const result = await postDiscordBotMessage(profile.discordChannelId, content.trim());
    if (result.ok) {
      return { ok: true, via: "bot" };
    }
  }

  const webhookUrl = profile?.discordWebhookUrl;

  if (!webhookUrl || !DISCORD_WEBHOOK_PATTERN.test(webhookUrl)) {
    return {
      ok: false,
      error:
        "Link the Discord bot or add a webhook in Settings before publishing.",
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.trim() }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[publishDiscordForUser]", response.status, text);
    return {
      ok: false,
      error: "Discord rejected the message. Check your webhook URL.",
    };
  }

  return { ok: true, via: "webhook" };
}
