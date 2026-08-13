import { createSupabaseAdmin } from "@/lib/supabase/server";

export type ScheduledPostStatus =
  | "pending"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export type ScheduledPost = {
  id: string;
  userId: string;
  patchNoteId: string | null;
  platform: "discord";
  content: string;
  scheduledAt: string;
  timezone: string;
  status: ScheduledPostStatus;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
};

type ScheduledPostRow = {
  id: string;
  user_id: string;
  patch_note_id: string | null;
  platform: string;
  content: string;
  scheduled_at: string;
  timezone: string;
  status: ScheduledPostStatus;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
};

function mapRow(row: ScheduledPostRow): ScheduledPost {
  return {
    id: row.id,
    userId: row.user_id,
    patchNoteId: row.patch_note_id,
    platform: "discord",
    content: row.content,
    scheduledAt: row.scheduled_at,
    timezone: row.timezone,
    status: row.status,
    lastError: row.last_error,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export async function countPendingScheduledPosts(userId: string): Promise<number> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("scheduled_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("[countPendingScheduledPosts]", error);
    return 0;
  }

  return count ?? 0;
}

export async function createScheduledPost(input: {
  userId: string;
  patchNoteId?: string | null;
  content: string;
  scheduledAt: Date;
  timezone: string;
}): Promise<ScheduledPost | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert({
      user_id: input.userId,
      patch_note_id: input.patchNoteId ?? null,
      platform: "discord",
      content: input.content,
      scheduled_at: input.scheduledAt.toISOString(),
      timezone: input.timezone,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[createScheduledPost]", error);
    return null;
  }

  return mapRow(data as ScheduledPostRow);
}

export async function listScheduledPostsForUser(
  userId: string,
  options?: { patchNoteId?: string; status?: ScheduledPostStatus },
): Promise<ScheduledPost[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("scheduled_posts")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (options?.patchNoteId) {
    query = query.eq("patch_note_id", options.patchNoteId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[listScheduledPostsForUser]", error);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as ScheduledPostRow));
}

export async function cancelScheduledPost(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("scheduled_posts")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("[cancelScheduledPost]", error);
    return false;
  }

  return true;
}

export async function listDueScheduledPosts(
  limit = 25,
): Promise<ScheduledPost[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[listDueScheduledPosts]", error);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as ScheduledPostRow));
}

export async function markScheduledPostSending(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("scheduled_posts")
    .update({ status: "sending" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    console.error("[markScheduledPostSending]", error);
    return false;
  }

  return true;
}

export async function markScheduledPostSent(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("scheduled_posts")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", id);

  if (error) {
    console.error("[markScheduledPostSent]", error);
    return false;
  }

  return true;
}

export async function markScheduledPostFailed(
  id: string,
  errorMessage: string,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("scheduled_posts")
    .update({
      status: "failed",
      last_error: errorMessage.slice(0, 500),
    })
    .eq("id", id);

  if (error) {
    console.error("[markScheduledPostFailed]", error);
    return false;
  }

  return true;
}

export async function resetScheduledPostToPending(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("scheduled_posts")
    .update({ status: "pending" })
    .eq("id", id)
    .eq("status", "sending");

  if (error) {
    console.error("[resetScheduledPostToPending]", error);
    return false;
  }

  return true;
}
