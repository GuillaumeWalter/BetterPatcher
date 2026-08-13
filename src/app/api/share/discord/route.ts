import { auth } from "@/auth";
import { publishDiscordForUser } from "@/lib/share/publish-discord";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content =
    typeof body === "object" &&
    body !== null &&
    "content" in body &&
    typeof body.content === "string"
      ? body.content
      : "";

  const result = await publishDiscordForUser(session.user.id, content);

  if (!result.ok) {
    const status = result.error.includes("2000") ? 400 : 502;
    return Response.json({ error: result.error }, { status });
  }

  return Response.json({ success: true, via: result.via });
}
