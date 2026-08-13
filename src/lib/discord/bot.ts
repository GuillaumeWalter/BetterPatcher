import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";

import {
  getDiscordApplicationId,
  getDiscordBotToken,
  getDiscordPublicKey,
} from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const LINK_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function getBotInviteUrl(): string | null {
  const appId = getDiscordApplicationId();
  if (!appId) return null;

  const permissions = "2048"; // Send Messages
  const params = new URLSearchParams({
    client_id: appId,
    permissions,
    scope: "bot applications.commands",
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function verifyDiscordRequest(request: Request): Promise<{
  ok: boolean;
  body: string;
}> {
  const publicKey = getDiscordPublicKey();
  if (!publicKey) {
    return { ok: false, body: "" };
  }

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();

  if (!signature || !timestamp) {
    return { ok: false, body };
  }

  const valid = await verifyKey(body, signature, timestamp, publicKey);
  return { ok: valid, body };
}

export async function postDiscordBotMessage(
  channelId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = getDiscordBotToken();
  if (!token) {
    return { ok: false, error: "bot_not_configured" };
  }

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[discord/bot] post", response.status, text);
    return { ok: false, error: "discord_rejected" };
  }

  return { ok: true };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function findUserByLinkCode(code: string) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, email")
    .eq("discord_link_code", code)
    .gt("discord_link_code_expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[discord/link] lookup", error);
    return null;
  }

  return data;
}

async function saveDiscordChannelLink(input: {
  userId: string;
  guildId: string;
  channelId: string;
}) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      discord_guild_id: input.guildId,
      discord_channel_id: input.channelId,
      discord_link_code: null,
      discord_link_code_expires_at: null,
    })
    .eq("user_id", input.userId);

  if (error) {
    console.error("[discord/link] save", error);
    return false;
  }

  return true;
}

export async function handleDiscordInteraction(rawBody: string) {
  const interaction = JSON.parse(rawBody) as {
    type: number;
    data?: {
    name?: string;
    options?: Array<{
      name: string;
      type?: number;
      value?: string;
      options?: Array<{ name: string; value: string }>;
    }>;
  };
    guild_id?: string;
    channel_id?: string;
  };

  if (interaction.type === InteractionType.PING) {
    return jsonResponse({ type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Unknown interaction." },
    });
  }

  const command = interaction.data?.name;
  const subcommand = interaction.data?.options?.[0]?.name;

  if (command === "easypatch" && subcommand === "link") {
    const code = interaction.data?.options?.[0]?.options?.find(
      (o) => o.name === "code",
    )?.value
      ?.trim()
      .toUpperCase();

    if (!code || !LINK_CODE_PATTERN.test(code)) {
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            "Invalid code. Generate a new link code in Easy Patch → Settings.",
        },
      });
    }

    const user = await findUserByLinkCode(code);
    if (!user) {
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Code expired or not found. Generate a new one in Settings.",
        },
      });
    }

    if (!interaction.guild_id || !interaction.channel_id) {
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Run this command in the channel you want to link." },
      });
    }

    const saved = await saveDiscordChannelLink({
      userId: user.user_id,
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
    });

    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: saved
          ? `✅ Channel linked to Easy Patch (${user.email ?? "your account"}). Use Share Studio → Post to Discord.`
          : "Could not save the link. Try again later.",
      },
    });
  }

  if (command === "easypatch" && subcommand === "status") {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          "Easy Patch bot is online. Link your channel with `/easypatch link <code>` (code from app Settings).",
      },
    });
  }

  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: "Unknown command." },
  });
}

export function generateLinkCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
