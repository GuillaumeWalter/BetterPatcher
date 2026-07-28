import { auth } from "@/auth";
import { isGitLabOAuthConfigured } from "@/lib/gitlab";
import {
  getGitLabAccessToken,
  setGitLabAccessToken,
} from "@/lib/supabase/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const token = await getGitLabAccessToken(session.user.id);

  return Response.json({
    connected: Boolean(token),
    configured: isGitLabOAuthConfigured(),
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const ok = await setGitLabAccessToken(session.user.id, null);
  if (!ok) {
    return Response.json({ error: "Could not disconnect GitLab." }, { status: 500 });
  }

  return Response.json({ connected: false });
}
