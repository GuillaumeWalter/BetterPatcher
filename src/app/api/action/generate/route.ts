import {
  DEFAULT_GENERATION_OPTIONS,
  parseGenerationOptions,
  type Tone,
} from "@/lib/constants";
import { generatePatchNoteForUser } from "@/lib/automation/generate-patch-note";
import { verifyIntegrationToken } from "@/lib/integrations/tokens";
import { getUserProfile } from "@/lib/supabase/users";

function parseTone(value: unknown): Tone {
  if (value === "marketing" || value === "gaming" || value === "technical") {
    return value;
  }
  return "technical";
}

function resolveAuth(request: Request): {
  userId: string | null;
  token: string | null;
} {
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization");

  if (headerAuth?.startsWith("EasyPatch ")) {
    const parts = headerAuth.slice("EasyPatch ".length).split(":");
    if (parts.length === 2) {
      return { userId: parts[0], token: parts[1] };
    }
  }

  return {
    userId: url.searchParams.get("userId"),
    token: url.searchParams.get("token"),
  };
}

/**
 * GitHub Action / CI endpoint — generate a patch note with integration token auth.
 * POST body: { commits, tone?, repoFullName?, tag?, options? }
 */
export async function POST(request: Request) {
  const { userId, token } = resolveAuth(request);

  if (!userId || !verifyIntegrationToken(userId, token)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const commits =
    typeof body === "object" &&
    body !== null &&
    "commits" in body &&
    typeof body.commits === "string"
      ? body.commits.trim()
      : "";

  if (!commits) {
    return Response.json({ error: "commits is required." }, { status: 400 });
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const tone = parseTone(
    typeof body === "object" && body !== null && "tone" in body
      ? body.tone
      : undefined,
  );

  const repoFullName =
    typeof body === "object" &&
    body !== null &&
    "repoFullName" in body &&
    typeof body.repoFullName === "string"
      ? body.repoFullName.trim() || null
      : null;

  const tag =
    typeof body === "object" &&
    body !== null &&
    "tag" in body &&
    typeof body.tag === "string"
      ? body.tag.trim()
      : null;

  const options =
    typeof body === "object" && body !== null && "options" in body
      ? parseGenerationOptions(body.options)
      : DEFAULT_GENERATION_OPTIONS;

  let commitsRaw = commits;
  if (tag && !commits.includes(tag)) {
    commitsRaw = `Release ${tag}\n\n${commits}`;
  }

  const result = await generatePatchNoteForUser({
    profile,
    commits: commitsRaw,
    tone,
    options,
    repoFullName,
  });

  if (!result.ok) {
    const status =
      result.code === "quota_exceeded" || result.code === "subscription_required"
        ? 402
        : result.code === "ai_not_configured"
          ? 503
          : 500;

    return Response.json({ error: result.error, code: result.code }, { status });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  return Response.json({
    ok: true,
    savedId: result.savedId,
    markdown: result.markdown,
    socialPost: result.socialPost,
    generationsRemaining: result.generationsRemaining,
    historyUrl: baseUrl
      ? `${baseUrl}/dashboard/history/${result.savedId}`
      : `/dashboard/history/${result.savedId}`,
  });
}
