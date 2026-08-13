import { auth } from "@/auth";
import { deleteUserAccount } from "@/lib/supabase/account";
import { captureException } from "@/lib/monitoring";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError('Send { "confirmation": "DELETE" } to confirm.', 400);
    }

    const confirmation =
      typeof body === "object" &&
      body !== null &&
      "confirmation" in body &&
      typeof body.confirmation === "string"
        ? body.confirmation
        : "";

    if (confirmation !== "DELETE") {
      return jsonError('Type DELETE to confirm account deletion.', 400);
    }

    const result = await deleteUserAccount(session.user.id);
    if (!result.ok) {
      if (result.error === "leave_team_first") {
        return jsonError(
          "Leave your Pro team in Settings before deleting your account.",
          400,
        );
      }
      return jsonError("Could not delete account.", 500);
    }

    return Response.json({ ok: true });
  } catch (error) {
    captureException(error, { route: "/api/account" });
    return jsonError("Account deletion failed.", 500);
  }
}
