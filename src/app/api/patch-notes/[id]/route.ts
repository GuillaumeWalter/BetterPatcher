import { auth } from "@/auth";
import { updatePatchNoteForUser } from "@/lib/supabase/patch-notes";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const markdown =
    typeof body === "object" &&
    body !== null &&
    "markdown" in body &&
    typeof body.markdown === "string"
      ? body.markdown
      : undefined;

  const socialPost =
    typeof body === "object" &&
    body !== null &&
    "socialPost" in body &&
    typeof body.socialPost === "string"
      ? body.socialPost
      : undefined;

  if (markdown === undefined && socialPost === undefined) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const ok = await updatePatchNoteForUser(session.user.id, id, {
    markdown,
    socialPost,
  });

  if (!ok) {
    return Response.json(
      { error: "Patch note not found or save failed." },
      { status: 404 },
    );
  }

  return Response.json({ success: true });
}
