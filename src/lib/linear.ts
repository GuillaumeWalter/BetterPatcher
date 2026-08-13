import { createHmac, timingSafeEqual } from "crypto";

import { getAuthSecret } from "@/lib/env";
import { getAppBaseUrl } from "@/lib/stripe";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getLinearClientId(): string | undefined {
  return readEnv("AUTH_LINEAR_ID", "LINEAR_CLIENT_ID");
}

export function getLinearClientSecret(): string | undefined {
  return readEnv("AUTH_LINEAR_SECRET", "LINEAR_CLIENT_SECRET");
}

export function getLinearCallbackUrl(): string {
  return `${getAppBaseUrl()}/api/linear/callback`;
}

export function isLinearOAuthConfigured(): boolean {
  return Boolean(
    getLinearClientId() && getLinearClientSecret() && getAuthSecret(),
  );
}

export function createLinearOAuthState(userId: string): string {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET missing.");

  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + 10 * 60 * 1000 }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function parseLinearOAuthState(state: string): string | null {
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

export function buildLinearAuthorizeUrl(state: string): string {
  const clientId = getLinearClientId();
  if (!clientId) throw new Error("Linear OAuth not configured.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getLinearCallbackUrl(),
    response_type: "code",
    scope: "read",
    state,
  });

  return `https://linear.app/oauth/authorize?${params.toString()}`;
}

export async function exchangeLinearCode(code: string): Promise<string> {
  const clientId = getLinearClientId();
  const clientSecret = getLinearClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Linear OAuth not configured.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLinearCallbackUrl(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Could not exchange Linear authorization code.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Linear token missing in response.");
  }

  return data.access_token;
}

export type LinearIssueSummary = {
  identifier: string;
  title: string;
  state: string | null;
};

async function linearGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error("Linear API request failed.");
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Linear GraphQL error.");
  }

  if (!payload.data) {
    throw new Error("Linear API returned no data.");
  }

  return payload.data;
}

const SEARCH_ISSUE_QUERY = `
  query SearchIssue($term: String!) {
    searchIssues(term: $term, first: 1) {
      nodes {
        identifier
        title
        state { name }
      }
    }
  }
`;

export async function fetchLinearIssueByKey(
  accessToken: string,
  key: string,
): Promise<LinearIssueSummary | null> {
  const data = await linearGraphql<{
    searchIssues: {
      nodes: Array<{
        identifier: string;
        title: string;
        state: { name: string } | null;
      }>;
    };
  }>(accessToken, SEARCH_ISSUE_QUERY, { term: key });

  const node = data.searchIssues.nodes[0];
  if (!node || node.identifier.toUpperCase() !== key.toUpperCase()) {
    return null;
  }

  return {
    identifier: node.identifier,
    title: node.title,
    state: node.state?.name ?? null,
  };
}

export async function fetchLinearIssues(
  accessToken: string,
  keys: string[],
): Promise<LinearIssueSummary[]> {
  const results: LinearIssueSummary[] = [];

  for (const key of keys) {
    try {
      const issue = await fetchLinearIssueByKey(accessToken, key);
      if (issue) results.push(issue);
    } catch (error) {
      console.error("[linear] fetch issue", key, error);
    }
  }

  return results;
}

export function formatTicketContextForPrompt(
  issues: LinearIssueSummary[],
): string {
  if (issues.length === 0) return "";

  return issues
    .map((issue) => {
      const state = issue.state ? ` (${issue.state})` : "";
      return `- ${issue.identifier}: ${issue.title}${state}`;
    })
    .join("\n");
}
