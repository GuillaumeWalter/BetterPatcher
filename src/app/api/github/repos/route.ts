import { auth } from "@/auth";
import { getUserRepos } from "@/lib/github";

async function requireAccessToken() {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: Response.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  return { accessToken: session.accessToken };
}

export async function GET() {
  const authResult = await requireAccessToken();
  if ("error" in authResult) return authResult.error;

  try {
    const repos = await getUserRepos(authResult.accessToken);
    return Response.json(
      repos.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        private: repo.private,
        updatedAt: repo.updated_at,
      })),
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch repositories." },
      { status: 502 },
    );
  }
}
