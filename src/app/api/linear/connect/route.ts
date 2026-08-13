import { auth } from "@/auth";
import {
  buildLinearAuthorizeUrl,
  createLinearOAuthState,
  isLinearOAuthConfigured,
} from "@/lib/linear";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isLinearOAuthConfigured()) {
    return Response.json(
      {
        error:
          "Linear OAuth is not configured (AUTH_LINEAR_ID / AUTH_LINEAR_SECRET).",
      },
      { status: 503 },
    );
  }

  try {
    const state = createLinearOAuthState(session.user.id);
    return Response.redirect(buildLinearAuthorizeUrl(state));
  } catch (error) {
    console.error("[linear/connect]", error);
    return Response.json(
      { error: "Could not start Linear connect." },
      { status: 500 },
    );
  }
}
