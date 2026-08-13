import { readEnv } from "@/lib/env";
import {
  verifyGitHubWebhookSignature,
  verifyIntegrationToken,
} from "@/lib/integrations/tokens";
import { getCompareCommits, parseRepoFullName } from "@/lib/github";
import { generatePatchNoteForUser } from "@/lib/automation/generate-patch-note";
import { getAiProvider } from "@/lib/ai/model";
import { DEFAULT_GENERATION_OPTIONS } from "@/lib/constants";
import {
  findUserByReleaseRepo,
  getGitHubAccessToken,
  getUserProfile,
} from "@/lib/supabase/users";

function getWebhookSecret(): string | undefined {
  return readEnv("GITHUB_WEBHOOK_SECRET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const token = url.searchParams.get("token");

  const payload = await request.text();
  const githubSignature = request.headers.get("x-hub-signature-256");
  const webhookSecret = getWebhookSecret();

  let profile =
    userId && verifyIntegrationToken(userId, token)
      ? await getUserProfile(userId)
      : null;

  if (webhookSecret) {
    if (!verifyGitHubWebhookSignature(payload, githubSignature, webhookSecret)) {
      return Response.json({ error: "Invalid signature." }, { status: 401 });
    }
  } else if (!profile) {
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }

  let event: {
    action?: string;
    release?: {
      tag_name?: string;
      target_commitish?: string;
      name?: string;
    };
    repository?: { full_name?: string };
  };

  try {
    event = JSON.parse(payload) as typeof event;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = request.headers.get("x-github-event");
  if (eventName !== "release" || event.action !== "published") {
    return Response.json({ ok: true, skipped: true });
  }

  const repoFullName = event.repository?.full_name;
  const tagName = event.release?.tag_name;

  if (!repoFullName || !tagName) {
    return Response.json({ error: "Missing release data." }, { status: 400 });
  }

  if (!profile) {
    profile = await findUserByReleaseRepo(repoFullName);
  }

  if (!profile || profile.releaseAutoRepo !== repoFullName) {
    return Response.json({ ok: true, skipped: true, reason: "repo_not_watched" });
  }

  if (!getAiProvider()) {
    return Response.json({ error: "AI not configured." }, { status: 503 });
  }

  const accessToken = await getGitHubAccessToken(profile.userId);
  if (!accessToken) {
    return Response.json(
      { error: "GitHub token missing. Sign in again to refresh access." },
      { status: 400 },
    );
  }

  const { owner, repo } = parseRepoFullName(repoFullName);
  const tone = "technical";

  let commits = `Release ${tagName}`;
  if (event.release?.name) {
    commits = `${event.release.name}\n${commits}`;
  }

  try {
    const compared = await getCompareCommits(
      accessToken,
      owner,
      repo,
      `${tagName}^`,
      tagName,
    );
    if (compared.trim()) commits = compared;
  } catch {
    // Fall back to release title only.
  }

  const result = await generatePatchNoteForUser({
    profile,
    commits,
    tone,
    options: DEFAULT_GENERATION_OPTIONS,
    repoFullName,
  });

  if (!result.ok) {
    const status = result.code === "quota_exceeded" ? 402 : 500;
    return Response.json({ error: result.error, code: result.code }, { status });
  }

  return Response.json({
    ok: true,
    savedId: result.savedId,
    tag: tagName,
    repo: repoFullName,
    historyUrl: `/dashboard/history/${result.savedId}`,
  });
}
