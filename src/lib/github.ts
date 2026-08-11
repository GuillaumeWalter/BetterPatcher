import { messagesForGenerator } from "@/lib/commit-messages";

export type GitHubRepo = {
  id: number;
  full_name: string;
  private: boolean;
  updated_at: string;
  default_branch: string;
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
};

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export async function getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    "https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator,organization_member",
    { headers: GITHUB_HEADERS(accessToken), next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error("Could not fetch GitHub repositories.");
  }

  return response.json() as Promise<GitHubRepo[]>;
}

export async function getRepoCommits(
  accessToken: string,
  owner: string,
  repo: string,
  limit = 30,
): Promise<GitHubCommit[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
    { headers: GITHUB_HEADERS(accessToken), next: { revalidate: 30 } },
  );

  if (!response.ok) {
    throw new Error("Could not fetch commits.");
  }

  return response.json() as Promise<GitHubCommit[]>;
}

export function formatCommitsForGenerator(commits: GitHubCommit[]): string {
  return messagesForGenerator(commits.map((entry) => entry.commit.message));
}

export async function getCompareCommits(
  accessToken: string,
  owner: string,
  repo: string,
  base: string,
  head: string,
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`,
    { headers: GITHUB_HEADERS(accessToken), next: { revalidate: 0 } },
  );

  if (!response.ok) {
    throw new Error("Could not compare release commits.");
  }

  const data = (await response.json()) as {
    commits?: GitHubCommit[];
  };

  return formatCommitsForGenerator(data.commits ?? []);
}

export function parseRepoFullName(fullName: string): {
  owner: string;
  repo: string;
} {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}
