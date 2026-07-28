import { auth } from "@/auth";
import {
  buildGitLabAuthorizeUrl,
  createGitLabOAuthState,
  isGitLabOAuthConfigured,
} from "@/lib/gitlab";
import { getAppBaseUrl } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  const baseUrl = getAppBaseUrl();

  if (!session?.user?.id) {
    return Response.redirect(
      `${baseUrl}/login?callbackUrl=${encodeURIComponent("/dashboard/generate")}`,
    );
  }

  if (!isGitLabOAuthConfigured()) {
    return Response.json(
      {
        error:
          "GitLab OAuth is not configured (AUTH_GITLAB_ID / AUTH_GITLAB_SECRET).",
      },
      { status: 503 },
    );
  }

  try {
    const state = createGitLabOAuthState(session.user.id);
    return Response.redirect(buildGitLabAuthorizeUrl(state));
  } catch (error) {
    console.error("[gitlab/connect]", error);
    return Response.json(
      { error: "Could not start GitLab connect." },
      { status: 500 },
    );
  }
}
