import { auth } from "@/auth";
import {
  getFavoriteRepos,
  setFavoriteRepos,
  toggleFavoriteRepo,
} from "@/lib/supabase/users";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  const favorites = await getFavoriteRepos(session.user.id);
  return Response.json({ favorites });
}

export async function PATCH(request: Request) {
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

  if (
    typeof body === "object" &&
    body !== null &&
    "toggle" in body &&
    typeof body.toggle === "string"
  ) {
    const result = await toggleFavoriteRepo(session.user.id, body.toggle);
    if (!result) {
      return jsonError("Could not update favorites.", 500);
    }
    return Response.json(result);
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "favorites" in body &&
    Array.isArray(body.favorites)
  ) {
    const repos = body.favorites.filter((v): v is string => typeof v === "string");
    const ok = await setFavoriteRepos(session.user.id, repos);
    if (!ok) {
      return jsonError("Could not save favorites.", 500);
    }
    return Response.json({ favorites: repos });
  }

  return jsonError("Send { toggle: repo } or { favorites: [] }.", 400);
}
