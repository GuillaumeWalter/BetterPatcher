import { getStripe } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/users";

export async function deleteUserAccount(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "database_unavailable" };
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return { ok: false, error: "profile_not_found" };
  }

  if (profile.workspaceOwnerId) {
    return {
      ok: false,
      error: "leave_team_first",
    };
  }

  const stripe = getStripe();
  if (stripe && profile.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(profile.stripeSubscriptionId);
    } catch (error) {
      console.error("[deleteUserAccount] stripe cancel", error);
    }
  }

  const { data: members } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("workspace_owner_id", userId);

  if (members?.length) {
    await supabase
      .from("user_profiles")
      .update({ workspace_owner_id: null })
      .eq("workspace_owner_id", userId);
  }

  await supabase.from("team_invites").delete().eq("owner_user_id", userId);

  const { data: patchNotes } = await supabase
    .from("patch_notes")
    .select("id")
    .eq("user_id", userId);

  const patchNoteIds = (patchNotes ?? []).map((row) => row.id);
  if (patchNoteIds.length > 0) {
    await supabase
      .from("platform_drafts")
      .delete()
      .in("patch_note_id", patchNoteIds);
  }

  await supabase.from("patch_notes").delete().eq("user_id", userId);
  await supabase.from("user_profiles").delete().eq("user_id", userId);

  return { ok: true };
}
