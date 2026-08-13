import { auth } from "@/auth";
import { generateLinkCode, getBotInviteUrl } from "@/lib/discord/bot";
import { getUserProfile } from "@/lib/supabase/users";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.id);
  const inviteUrl = getBotInviteUrl();

  return Response.json({
    inviteUrl,
    botConfigured: Boolean(inviteUrl),
    guildId: profile?.discordGuildId ?? null,
    channelId: profile?.discordChannelId ?? null,
    linked: Boolean(profile?.discordChannelId),
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Database unavailable." }, { status: 503 });
  }

  const code = generateLinkCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const { error } = await supabase
    .from("user_profiles")
    .update({
      discord_link_code: code,
      discord_link_code_expires_at: expiresAt.toISOString(),
    })
    .eq("user_id", session.user.id);

  if (error) {
    console.error("[discord/link-code]", error);
    return Response.json({ error: "Could not generate code." }, { status: 500 });
  }

  const inviteUrl = getBotInviteUrl();

  return Response.json({
    code,
    expiresAt: expiresAt.toISOString(),
    inviteUrl,
    instructions:
      "1) Invite the bot to your server · 2) Run `/easypatch link " +
      code +
      "` in the target channel",
  });
}
