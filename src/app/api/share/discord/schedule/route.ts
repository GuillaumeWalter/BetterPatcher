import { auth } from "@/auth";
import { BILLING } from "@/lib/billing/constants";
import { publishDiscordForUser, validateDiscordContent } from "@/lib/share/publish-discord";
import { getPatchNoteForUser } from "@/lib/supabase/patch-notes";
import {
  cancelScheduledPost,
  countPendingScheduledPosts,
  createScheduledPost,
  listScheduledPostsForUser,
} from "@/lib/supabase/scheduled-posts";
import { getUserQuota } from "@/lib/supabase/users";

const MAX_SCHEDULE_AHEAD_MS = 30 * 24 * 60 * 60 * 1000;

function parseScheduleDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function scheduleLimitForUser(userId: string): Promise<number> {
  const quota = await getUserQuota(userId);
  if (!quota) return BILLING.SCHEDULE_MAX_PENDING_TRIAL;

  if (quota.plan === "solo" || quota.plan === "pro") {
    return BILLING.SCHEDULE_MAX_PENDING_PAID;
  }

  return BILLING.SCHEDULE_MAX_PENDING_TRIAL;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const patchNoteId = new URL(request.url).searchParams.get("patchNoteId");

  const posts = await listScheduledPostsForUser(session.user.id, {
    patchNoteId: patchNoteId ?? undefined,
    status: "pending",
  });

  return Response.json({ posts });
}

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
      ? body.content
      : "";

  const validation = validateDiscordContent(content);
  if (validation) {
    return Response.json({ error: validation }, { status: 400 });
  }

  const scheduledAt = parseScheduleDate(
    typeof body === "object" && body !== null && "scheduledAt" in body
      ? body.scheduledAt
      : undefined,
  );

  if (!scheduledAt) {
    return Response.json({ error: "Invalid scheduledAt datetime." }, { status: 400 });
  }

  const now = Date.now();
  if (scheduledAt.getTime() <= now + 60_000) {
    return Response.json(
      { error: "Schedule at least 1 minute in the future." },
      { status: 400 },
    );
  }

  if (scheduledAt.getTime() > now + MAX_SCHEDULE_AHEAD_MS) {
    return Response.json(
      { error: "Cannot schedule more than 30 days ahead." },
      { status: 400 },
    );
  }

  const timezone =
    typeof body === "object" &&
    body !== null &&
    "timezone" in body &&
    typeof body.timezone === "string" &&
    body.timezone.trim()
      ? body.timezone.trim()
      : "UTC";

  const patchNoteId =
    typeof body === "object" &&
    body !== null &&
    "patchNoteId" in body &&
    typeof body.patchNoteId === "string"
      ? body.patchNoteId
      : null;

  if (patchNoteId) {
    const note = await getPatchNoteForUser(session.user.id, patchNoteId);
    if (!note || note.user_id !== session.user.id) {
      return Response.json({ error: "Patch note not found." }, { status: 404 });
    }
  }

  const limit = await scheduleLimitForUser(session.user.id);
  const pending = await countPendingScheduledPosts(session.user.id);
  if (pending >= limit) {
    return Response.json(
      {
        error: `Schedule limit reached (${limit} pending). Cancel one or upgrade for more.`,
        limit,
        pending,
      },
      { status: 429 },
    );
  }

  const post = await createScheduledPost({
    userId: session.user.id,
    patchNoteId,
    content: content.trim(),
    scheduledAt,
    timezone,
  });

  if (!post) {
    return Response.json({ error: "Could not schedule post." }, { status: 500 });
  }

  return Response.json({ post });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id." }, { status: 400 });
  }

  const ok = await cancelScheduledPost(session.user.id, id);
  if (!ok) {
    return Response.json(
      { error: "Could not cancel. It may already be sent or cancelled." },
      { status: 404 },
    );
  }

  return Response.json({ success: true });
}

/** Publish now (same as /api/share/discord) for clients that hit schedule route. */
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

  const action =
    typeof body === "object" &&
    body !== null &&
    "action" in body &&
    typeof body.action === "string"
      ? body.action
      : null;

  if (action !== "publish_now") {
    return Response.json({ error: "Unknown action." }, { status: 400 });
  }

  const content =
    typeof body === "object" &&
    body !== null &&
    "content" in body &&
    typeof body.content === "string"
      ? body.content
      : "";

  const result = await publishDiscordForUser(session.user.id, content);
  if (!result.ok) {
    const status = result.error.includes("Settings") ? 400 : 502;
    return Response.json({ error: result.error }, { status });
  }

  return Response.json({ success: true, via: result.via });
}
