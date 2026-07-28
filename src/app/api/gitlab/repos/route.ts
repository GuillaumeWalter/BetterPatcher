import { auth } from "@/auth";
import { getGitLabProjects } from "@/lib/gitlab";
import { getGitLabAccessToken } from "@/lib/supabase/users";

export async function GET() {
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

  try {
    const projects = await getGitLabProjects(token);
    return Response.json(
      projects.map((project) => ({
        id: project.id,
        fullName: project.path_with_namespace,
        private: project.visibility !== "public",
        updatedAt: project.last_activity_at,
      })),
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch GitLab projects." },
      { status: 502 },
    );
  }
}
