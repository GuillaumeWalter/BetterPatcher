import { auth } from "@/auth";
import { filterImportedCommits } from "@/lib/commit-messages";
import { getGitLabProjectCommits } from "@/lib/gitlab";
import { getGitLabAccessToken } from "@/lib/supabase/users";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const token = await getGitLabAccessToken(session.user.id);
  if (!token) {
    return Response.json(
      { error: "GitLab is not connected.", code: "gitlab_not_connected" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const project = searchParams.get("project");
  const projectId = searchParams.get("projectId");

  if (!project && !projectId) {
    return Response.json(
      { error: "project or projectId parameter required." },
      { status: 400 },
    );
  }

  try {
    const commits = await getGitLabProjectCommits(
      token,
      projectId ?? project!,
      50,
    );
    const filtered = filterImportedCommits(
      commits.map((entry) => ({
        sha: entry.short_id,
        message: entry.title || entry.message || "",
        date: entry.created_at,
      })),
    );

    return Response.json(filtered);
  } catch {
    return Response.json(
      { error: "Failed to fetch GitLab commits." },
      { status: 502 },
    );
  }
}
