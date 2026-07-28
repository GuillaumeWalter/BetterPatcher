import { auth } from "@/auth";
import { getRepoCommits, parseRepoFullName } from "@/lib/github";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!repo || !repo.includes("/")) {
    return Response.json(
      { error: "repo parameter required (e.g. owner/repo)." },
      { status: 400 },
    );
  }

  const { owner, repo: name } = parseRepoFullName(repo);

  try {
    const commits = await getRepoCommits(session.accessToken, owner, name);
    return Response.json(
      commits.map((entry) => ({
        sha: entry.sha.slice(0, 7),
        message: entry.commit.message,
        date: entry.commit.author.date,
      })),
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch commits." },
      { status: 502 },
    );
  }
}
