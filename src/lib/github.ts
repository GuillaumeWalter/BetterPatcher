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
    throw new Error("Impossible de récupérer les dépôts GitHub.");
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
    throw new Error("Impossible de récupérer les commits.");
  }

  return response.json() as Promise<GitHubCommit[]>;
}

export function formatCommitsForGenerator(commits: GitHubCommit[]): string {
  return commits.map((entry) => entry.commit.message.trim()).join("\n");
}

export function parseRepoFullName(fullName: string): {
  owner: string;
  repo: string;
} {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}
