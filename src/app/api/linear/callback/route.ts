import {
  exchangeLinearCode,
  parseLinearOAuthState,
} from "@/lib/linear";
import { getAppBaseUrl } from "@/lib/stripe";
import { setLinearAccessToken } from "@/lib/supabase/users";

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error === "access_denied") {
    return Response.redirect(
      `${baseUrl}/dashboard/generate?linear=denied`,
    );
  }

  if (!code || !state) {
    return Response.redirect(`${baseUrl}/dashboard/generate?linear=error`);
  }

  const userId = parseLinearOAuthState(state);
  if (!userId) {
    return Response.redirect(
      `${baseUrl}/dashboard/generate?linear=invalid_state`,
    );
  }

  try {
    const accessToken = await exchangeLinearCode(code);
    const saved = await setLinearAccessToken(userId, accessToken);
    if (!saved) {
      return Response.redirect(
        `${baseUrl}/dashboard/generate?linear=save_failed`,
      );
    }
    return Response.redirect(
      `${baseUrl}/dashboard/generate?linear=connected`,
    );
  } catch (err) {
    console.error("[linear/callback]", err);
    return Response.redirect(`${baseUrl}/dashboard/generate?linear=error`);
  }
}
