export const COMMITS_STORAGE_KEY = "release-hub-commits";
export const REPO_STORAGE_KEY = "release-hub-repo";

export function sendCommitsToGenerator(commits: string, repoFullName?: string | null) {
  sessionStorage.setItem(COMMITS_STORAGE_KEY, commits);
  if (repoFullName) {
    sessionStorage.setItem(REPO_STORAGE_KEY, repoFullName);
  } else {
    sessionStorage.removeItem(REPO_STORAGE_KEY);
  }
  window.location.href = "/";
}
