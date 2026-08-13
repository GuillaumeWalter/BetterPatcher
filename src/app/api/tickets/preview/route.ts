import { auth } from "@/auth";
import { resolveTicketsForGeneration } from "@/lib/generation/resolve-tickets";
import { getUserQuota } from "@/lib/supabase/users";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const commits =
    typeof body === "object" &&
    body !== null &&
    "commits" in body &&
    typeof body.commits === "string"
      ? body.commits
      : "";

  const quota = await getUserQuota(session.user.id);
  const plan = quota?.plan ?? "trial";

  const { resolution } = await resolveTicketsForGeneration({
    userId: session.user.id,
    commits,
    plan,
  });

  return Response.json(resolution);
}
