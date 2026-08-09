import { createHmac, timingSafeEqual } from "crypto";

import { normalizeImportedCommitMessages } from "@/lib/commit-messages";
import { getAuthSecret } from "@/lib/env";
import { getAppBaseUrl } from "@/lib/stripe";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getGitLabClientId(): string | undefined {
  return readEnv("AUTH_GITLAB_ID", "GITLAB_CLIENT_ID");
}

export function getGitLabClientSecret(): string | undefined {
  return readEnv("AUTH_GITLAB_SECRET", "GITLAB_CLIENT_SECRET");
}

export function getGitLabBaseUrl(): string {
  return (readEnv("GITLAB_BASE_URL") ?? "https://gitlab.com").replace(/\/$/, "");
}

export function getGitLabCallbackUrl(): string {
  return `${getAppBaseUrl()}/api/gitlab/callback`;
}

export function isGitLabOAuthConfigured(): boolean {
  return Boolean(getGitLabClientId() && getGitLabClientSecret() && getAuthSecret());
}

export function createGitLabOAuthState(userId: string): string {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET missing.");

  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + 10 * 60 * 1000 }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function parseGitLabOAuthState(state: string): string | null {
  const secret = getAuthSecret();
  if (!secret) return null;

  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
      exp?: number;
    };
    if (!data.userId || typeof data.exp !== "number" || Date.now() > data.exp) {
      return null;
    }
    return data.userId;
  } catch {
    return null;
  }
}

export function buildGitLabAuthorizeUrl(state: string): string {
  const clientId = getGitLabClientId();
  if (!clientId) throw new Error("GitLab OAuth not configured.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGitLabCallbackUrl(),
    response_type: "code",
    scope: "read_user read_api",
    state,
  });

  return `${getGitLabBaseUrl()}/oauth/authorize?${params.toString()}`;
}

export async function exchangeGitLabCode(code: string): Promise<string> {
  const clientId = getGitLabClientId();
  const clientSecret = getGitLabClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("GitLab OAuth not configured.");
  }

  const response = await fetch(`${getGitLabBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getGitLabCallbackUrl(),
    }),
  });

  if (!response.ok) {
    throw new Error("Could not exchange GitLab authorization code.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("GitLab token missing in response.");
  }

  return data.access_token;
}

export type GitLabProject = {
  id: number;
  path_with_namespace: string;
  visibility: string;
  last_activity_at: string;
};

export type GitLabCommit = {
  id: string;
  short_id: string;
  title: string;
  message: string;
  created_at: string;
};

function gitlabHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function getGitLabProjects(
  accessToken: string,
): Promise<GitLabProject[]> {
  const response = await fetch(
    `${getGitLabBaseUrl()}/api/v4/projects?membership=true&simple=true&order_by=last_activity_at&per_page=50`,
    { headers: gitlabHeaders(accessToken), next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error("Could not fetch GitLab projects.");
  }

  return response.json() as Promise<GitLabProject[]>;
}

export async function getGitLabProjectCommits(
  accessToken: string,
  projectId: string | number,
  limit = 30,
): Promise<GitLabCommit[]> {
  const encoded =
    typeof projectId === "number"
      ? String(projectId)
      : encodeURIComponent(projectId);

  const response = await fetch(
    `${getGitLabBaseUrl()}/api/v4/projects/${encoded}/repository/commits?per_page=${limit}`,
    { headers: gitlabHeaders(accessToken), next: { revalidate: 30 } },
  );

  if (!response.ok) {
    throw new Error("Could not fetch GitLab commits.");
  }

  return response.json() as Promise<GitLabCommit[]>;
}

export function formatGitLabCommitsForGenerator(commits: GitLabCommit[]): string {
  return normalizeImportedCommitMessages(
    commits.map((entry) => entry.title || entry.message),
  ).join("\n");
}
