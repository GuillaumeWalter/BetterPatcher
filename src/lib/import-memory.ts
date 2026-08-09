import type { ImportedCommit } from "@/lib/commit-messages";
import { commitSubject } from "@/lib/commit-messages";

const STORAGE_KEY = "easy-patch:import-memory:v1";

export type RememberedImport = {
  shas: string[];
  messages: string[];
  updatedAt: string;
};

function normalizeMessage(message: string): string {
  return commitSubject(message).toLowerCase();
}

function readAll(): Record<string, RememberedImport> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RememberedImport>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, RememberedImport>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRememberedImport(
  repoFullName: string,
): RememberedImport | null {
  const entry = readAll()[repoFullName];
  if (!entry) return null;
  return {
    shas: Array.isArray(entry.shas) ? entry.shas : [],
    messages: Array.isArray(entry.messages) ? entry.messages : [],
    updatedAt: entry.updatedAt ?? "",
  };
}

/** Merge selected commits into remembered set for this repo. */
export function rememberImportedCommits(
  repoFullName: string,
  commits: ImportedCommit[],
) {
  if (!repoFullName || commits.length === 0) return;

  const all = readAll();
  const previous = all[repoFullName];
  const shas = new Set(previous?.shas ?? []);
  const messages = new Set(previous?.messages ?? []);

  for (const commit of commits) {
    if (commit.sha) shas.add(commit.sha);
    const message = normalizeMessage(commit.message);
    if (message) messages.add(message);
  }

  all[repoFullName] = {
    shas: [...shas],
    messages: [...messages],
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
}

/** After a successful generation, mark paste lines as used for that repo. */
export function rememberGeneratedMessages(
  repoFullName: string | null | undefined,
  commitsText: string,
) {
  if (!repoFullName) return;

  const lines = commitsText
    .split(/\r?\n/)
    .map((line) => normalizeMessage(line))
    .filter(Boolean);

  if (lines.length === 0) return;

  const all = readAll();
  const previous = all[repoFullName];
  const messages = new Set(previous?.messages ?? []);
  for (const line of lines) messages.add(line);

  all[repoFullName] = {
    shas: previous?.shas ?? [],
    messages: [...messages],
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
}

export function isCommitRemembered(
  commit: ImportedCommit,
  remembered: RememberedImport | null,
): boolean {
  if (!remembered) return false;
  if (commit.sha && remembered.shas.includes(commit.sha)) return true;
  return remembered.messages.includes(normalizeMessage(commit.message));
}
