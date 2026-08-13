import { auth } from "@/auth";
import {
  getTeamSnapshot,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  revokeTeamInvite,
} from "@/lib/supabase/team";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  pro_required: "Pro subscription required to manage team seats.",
  seats_full: "All team seats are in use.",
  invalid_email: "Enter a valid email address.",
  cannot_invite_self: "You cannot invite yourself.",
  invite_failed: "Could not send invite.",
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  const team = await getTeamSnapshot(session.user.id);
  if (!team) {
    return jsonError("Profile not found.", 404);
  }

  return Response.json(team);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const action =
    typeof body === "object" && body !== null && "action" in body
      ? body.action
      : null;

  if (action === "invite") {
    const email =
      typeof body === "object" && body !== null && "email" in body
        ? body.email
        : null;
    if (typeof email !== "string") {
      return jsonError("Email is required.", 400);
    }

    const result = await inviteTeamMember(session.user.id, email);
    if (!result.ok) {
      return jsonError(ERROR_MESSAGES[result.error] ?? "Invite failed.", 400);
    }
    return Response.json({ ok: true });
  }

  if (action === "revoke") {
    const inviteId =
      typeof body === "object" && body !== null && "inviteId" in body
        ? body.inviteId
        : null;
    if (typeof inviteId !== "string") {
      return jsonError("inviteId is required.", 400);
    }

    const ok = await revokeTeamInvite(session.user.id, inviteId);
    if (!ok) return jsonError("Could not revoke invite.", 500);
    return Response.json({ ok: true });
  }

  if (action === "remove") {
    const memberId =
      typeof body === "object" && body !== null && "memberId" in body
        ? body.memberId
        : null;
    if (typeof memberId !== "string") {
      return jsonError("memberId is required.", 400);
    }

    const ok = await removeTeamMember(session.user.id, memberId);
    if (!ok) return jsonError("Could not remove member.", 500);
    return Response.json({ ok: true });
  }

  if (action === "leave") {
    const ok = await leaveTeam(session.user.id);
    if (!ok) return jsonError("Could not leave team.", 500);
    return Response.json({ ok: true });
  }

  return jsonError("Unknown action.", 400);
}
