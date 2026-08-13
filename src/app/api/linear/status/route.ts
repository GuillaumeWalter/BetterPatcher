import { auth } from "@/auth";
import { isLinearOAuthConfigured } from "@/lib/linear";
import {
  getLinearAccessToken,
  setLinearAccessToken,
} from "@/lib/supabase/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = await getLinearAccessToken(session.user.id);

  return Response.json({
    connected: Boolean(token),
    configured: isLinearOAuthConfigured(),
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ok = await setLinearAccessToken(session.user.id, null);
  if (!ok) {
    return Response.json({ error: "Could not disconnect Linear." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
