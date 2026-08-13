import { BILLING } from "@/lib/billing/constants";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type TeamInvite = {
  id: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
};

export type TeamMember = {
  userId: string;
  email: string | null;
};

export type TeamSnapshot = {
  isOwner: boolean;
  isMember: boolean;
  ownerId: string | null;
  ownerEmail: string | null;
  members: TeamMember[];
  pendingInvites: TeamInvite[];
  seatsUsed: number;
  seatsMax: number;
  canManage: boolean;
};

export async function resolveBillingUserId(userId: string): Promise<string> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return userId;

  const { data } = await supabase
    .from("user_profiles")
    .select("workspace_owner_id")
    .eq("user_id", userId)
    .maybeSingle();

  const ownerId = data?.workspace_owner_id;
  return typeof ownerId === "string" && ownerId.length > 0 ? ownerId : userId;
}

export async function getTeamSnapshot(userId: string): Promise<TeamSnapshot | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_id, email, workspace_owner_id, plan_tier, subscription_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return null;

  const ownerId =
    typeof profile.workspace_owner_id === "string" &&
    profile.workspace_owner_id.length > 0
      ? profile.workspace_owner_id
      : null;

  const isMember = Boolean(ownerId);
  const isOwner =
    !isMember &&
    profile.subscription_status === "active" &&
    profile.plan_tier === "pro";

  const effectiveOwnerId = ownerId ?? (isOwner ? userId : null);

  let members: TeamMember[] = [];
  let pendingInvites: TeamInvite[] = [];
  let ownerEmail: string | null = null;

  if (effectiveOwnerId) {
    const { data: owner } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("user_id", effectiveOwnerId)
      .maybeSingle();
    ownerEmail = owner?.email ?? null;

    const { data: memberRows } = await supabase
      .from("user_profiles")
      .select("user_id, email")
      .eq("workspace_owner_id", effectiveOwnerId);

    members = (memberRows ?? []).map((row) => ({
      userId: row.user_id,
      email: row.email,
    }));

    const { data: inviteRows } = await supabase
      .from("team_invites")
      .select("id, invitee_email, status, created_at")
      .eq("owner_user_id", effectiveOwnerId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    pendingInvites = (inviteRows ?? []).map((row) => ({
      id: row.id,
      inviteeEmail: row.invitee_email,
      status: row.status as TeamInvite["status"],
      createdAt: row.created_at,
    }));
  }

  const seatsUsed =
    (effectiveOwnerId ? 1 : 0) + members.length + pendingInvites.length;

  return {
    isOwner,
    isMember,
    ownerId: effectiveOwnerId,
    ownerEmail,
    members,
    pendingInvites,
    seatsUsed,
    seatsMax: BILLING.PRO_MAX_TEAM_SEATS,
    canManage: isOwner,
  };
}

export async function inviteTeamMember(
  ownerId: string,
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return { ok: false, error: "database_unavailable" };

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { ok: false, error: "invalid_email" };
  }

  const snapshot = await getTeamSnapshot(ownerId);
  if (!snapshot?.canManage) {
    return { ok: false, error: "pro_required" };
  }

  if (snapshot.seatsUsed >= snapshot.seatsMax) {
    return { ok: false, error: "seats_full" };
  }

  const { data: ownerProfile } = await supabase
    .from("user_profiles")
    .select("email")
    .eq("user_id", ownerId)
    .maybeSingle();

  if (ownerProfile?.email?.toLowerCase() === normalized) {
    return { ok: false, error: "cannot_invite_self" };
  }

  const { error } = await supabase.from("team_invites").upsert(
    {
      owner_user_id: ownerId,
      invitee_email: normalized,
      status: "pending",
    },
    { onConflict: "owner_user_id,invitee_email" },
  );

  if (error) {
    console.error("[inviteTeamMember]", error);
    return { ok: false, error: "invite_failed" };
  }

  return { ok: true };
}

export async function revokeTeamInvite(
  ownerId: string,
  inviteId: string,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("team_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("owner_user_id", ownerId);

  if (error) {
    console.error("[revokeTeamInvite]", error);
    return false;
  }

  return true;
}

export async function removeTeamMember(
  ownerId: string,
  memberId: string,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({ workspace_owner_id: null })
    .eq("user_id", memberId)
    .eq("workspace_owner_id", ownerId);

  if (error) {
    console.error("[removeTeamMember]", error);
    return false;
  }

  return true;
}

export async function leaveTeam(memberId: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({ workspace_owner_id: null })
    .eq("user_id", memberId);

  if (error) {
    console.error("[leaveTeam]", error);
    return false;
  }

  return true;
}

/** Accept pending invites on sign-in (email match). */
export async function acceptPendingTeamInvites(input: {
  userId: string;
  email: string;
}): Promise<number> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return 0;

  const normalized = input.email.trim().toLowerCase();

  const { data: invites } = await supabase
    .from("team_invites")
    .select("id, owner_user_id")
    .eq("invitee_email", normalized)
    .eq("status", "pending");

  if (!invites?.length) return 0;

  let accepted = 0;

  for (const invite of invites) {
    const ownerId = invite.owner_user_id;
    const { data: owner } = await supabase
      .from("user_profiles")
      .select("subscription_status, plan_tier")
      .eq("user_id", ownerId)
      .maybeSingle();

    if (
      owner?.subscription_status !== "active" ||
      owner?.plan_tier !== "pro"
    ) {
      continue;
    }

    const snapshot = await getTeamSnapshot(ownerId);
    if (!snapshot || snapshot.seatsUsed >= snapshot.seatsMax) {
      continue;
    }

    const { error: memberError } = await supabase
      .from("user_profiles")
      .update({
        workspace_owner_id: ownerId,
        payment_method_verified: true,
      })
      .eq("user_id", input.userId);

    if (memberError) {
      console.error("[acceptPendingTeamInvites] member", memberError);
      continue;
    }

    await supabase
      .from("team_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    accepted += 1;
    break;
  }

  return accepted;
}
