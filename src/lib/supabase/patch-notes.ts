import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Tone } from "@/lib/constants";
import { resolveHistoryUserIds } from "@/lib/supabase/history-access";

export type PatchNoteRow = {
  id: string;
  user_id: string;
  user_email: string | null;
  tone: Tone;
  repo_full_name: string | null;
  commits_raw: string;
  markdown: string;
  social_post: string;
  created_at: string;
  updated_at: string;
};

export type PatchNoteSummary = {
  id: string;
  tone: Tone;
  repoFullName: string | null;
  markdownPreview: string;
  createdAt: string;
  updatedAt: string;
  authorEmail: string | null;
  isOwn: boolean;
};

type SavePatchNoteInput = {
  userId: string;
  userEmail?: string | null;
  tone: Tone;
  commitsRaw: string;
  markdown: string;
  socialPost: string;
  repoFullName?: string | null;
};

export async function savePatchNote(
  input: SavePatchNoteInput,
): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("patch_notes")
    .insert({
      user_id: input.userId,
      user_email: input.userEmail ?? null,
      tone: input.tone,
      repo_full_name: input.repoFullName ?? null,
      commits_raw: input.commitsRaw,
      markdown: input.markdown,
      social_post: input.socialPost,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[savePatchNote]", error);
    return null;
  }

  return data.id;
}

export async function listPatchNotesForUser(
  userId: string,
): Promise<PatchNoteSummary[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const userIds = await resolveHistoryUserIds(userId);

  const { data, error } = await supabase
    .from("patch_notes")
    .select(
      "id, user_id, user_email, tone, repo_full_name, markdown, created_at, updated_at",
    )
    .in("user_id", userIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[listPatchNotesForUser]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tone: row.tone as Tone,
    repoFullName: row.repo_full_name,
    markdownPreview: row.markdown.slice(0, 120),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorEmail: row.user_email ?? null,
    isOwn: row.user_id === userId,
  }));
}

export async function countPatchNotesForUser(userId: string): Promise<number> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return 0;

  const userIds = await resolveHistoryUserIds(userId);

  const { count, error } = await supabase
    .from("patch_notes")
    .select("id", { count: "exact", head: true })
    .in("user_id", userIds);

  if (error) {
    console.error("[countPatchNotesForUser]", error);
    return 0;
  }

  return count ?? 0;
}

export async function getPatchNoteForUser(
  userId: string,
  id: string,
): Promise<PatchNoteRow | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const userIds = await resolveHistoryUserIds(userId);

  const { data, error } = await supabase
    .from("patch_notes")
    .select("*")
    .eq("id", id)
    .in("user_id", userIds)
    .single();

  if (error) {
    console.error("[getPatchNoteForUser]", error);
    return null;
  }

  return data as PatchNoteRow;
}

export async function updatePatchNoteForUser(
  userId: string,
  id: string,
  updates: { markdown?: string; socialPost?: string },
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const note = await getPatchNoteForUser(userId, id);
  if (!note || note.user_id !== userId) {
    return false;
  }

  const payload: Record<string, string> = {};
  if (updates.markdown !== undefined) payload.markdown = updates.markdown;
  if (updates.socialPost !== undefined) payload.social_post = updates.socialPost;

  if (Object.keys(payload).length === 0) return false;

  const { error } = await supabase
    .from("patch_notes")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[updatePatchNoteForUser]", error);
    return false;
  }

  return true;
}
