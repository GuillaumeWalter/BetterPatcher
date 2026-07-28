import {
  exchangeGitLabCode,
  parseGitLabOAuthState,
} from "@/lib/gitlab";
import { getAppBaseUrl } from "@/lib/stripe";
import { setGitLabAccessToken } from "@/lib/supabase/users";

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return Response.redirect(
      `${baseUrl}/dashboard/generate?gitlab=denied`,
    );
  }

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard/generate?gitlab=error`,
    );
  }

  const userId = parseGitLabOAuthState(state);
  if (!userId) {
    return Response.redirect(
      `${baseUrl}/dashboard/generate?gitlab=invalid_state`,
    );
  }

  try {
    const accessToken = await exchangeGitLabCode(code);
    const saved = await setGitLabAccessToken(userId, accessToken);
    if (!saved) {
      return Response.redirect(
        `${baseUrl}/dashboard/generate?gitlab=save_failed`,
      );
    }
    return Response.redirect(
      `${baseUrl}/dashboard/generate?gitlab=connected`,
    );
  } catch (error) {
    console.error("[gitlab/callback]", error);
    return Response.redirect(
      `${baseUrl}/dashboard/generate?gitlab=error`,
    );
  }
}
