import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  isSharePlatform,
  type PlatformDraft,
  type SharePlatform,
} from "@/lib/share/platforms";

export type PlatformDraftRow = {
  id: string;
  patch_note_id: string;
  platform: SharePlatform;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

function toDraft(row: PlatformDraftRow): PlatformDraft & { id: string } {
  return {
    id: row.id,
    platform: row.platform,
    title: row.title ?? "",
    body: row.body,
  };
}

export async function replacePlatformDrafts(
  patchNoteId: string,
  drafts: PlatformDraft[],
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error: deleteError } = await supabase
    .from("platform_drafts")
    .delete()
    .eq("patch_note_id", patchNoteId);

  if (deleteError) {
    console.error("[replacePlatformDrafts] delete", deleteError);
    return false;
  }

  if (drafts.length === 0) return true;

  const { error: insertError } = await supabase.from("platform_drafts").insert(
    drafts.map((draft) => ({
      patch_note_id: patchNoteId,
      platform: draft.platform,
      title: draft.title ?? "",
      body: draft.body,
    })),
  );

  if (insertError) {
    console.error("[replacePlatformDrafts] insert", insertError);
    return false;
  }

  return true;
}

export async function upsertPlatformDraft(
  patchNoteId: string,
  draft: PlatformDraft,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("platform_drafts").upsert(
    {
      patch_note_id: patchNoteId,
      platform: draft.platform,
      title: draft.title ?? "",
      body: draft.body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "patch_note_id,platform" },
  );

  if (error) {
    console.error("[upsertPlatformDraft]", error);
    return false;
  }

  return true;
}

export async function listPlatformDraftsForPatchNote(
  patchNoteId: string,
): Promise<(PlatformDraft & { id: string })[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("platform_drafts")
    .select("*")
    .eq("patch_note_id", patchNoteId)
    .order("platform", { ascending: true });

  if (error) {
    console.error("[listPlatformDraftsForPatchNote]", error);
    return [];
  }

  return (data as PlatformDraftRow[])
    .filter((row) => isSharePlatform(row.platform))
    .map(toDraft);
}

export async function updatePlatformDraftBody(
  patchNoteId: string,
  platform: SharePlatform,
  updates: { title?: string; body?: string },
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const payload: Record<string, string> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.body !== undefined) payload.body = updates.body;

  if (Object.keys(payload).length === 0) return false;

  const { error } = await supabase
    .from("platform_drafts")
    .update(payload)
    .eq("patch_note_id", patchNoteId)
    .eq("platform", platform);

  if (error) {
    console.error("[updatePlatformDraftBody]", error);
    return false;
  }

  return true;
}
