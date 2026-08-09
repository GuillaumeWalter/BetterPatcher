/** First line of a commit message (subject), trimmed. */
export function commitSubject(message: string): string {
  return message.split(/\r?\n/)[0]?.trim() ?? "";
}

/** Merge / empty subjects that pollute patch note generation. */
export function isNoiseCommitSubject(subject: string): boolean {
  if (!subject) return true;

  const lower = subject.toLowerCase();
  if (lower.startsWith("merge pull request")) return true;
  if (lower.startsWith("merge branch")) return true;
  if (lower.startsWith("merge remote-tracking branch")) return true;
  if (/^merge .+ into /.test(lower)) return true;

  return false;
}

export type ImportedCommit = {
  sha: string;
  message: string;
  date: string;
};

/**
 * Subject line only, drop merge noise. Keeps commit order (newest first).
 * Does not dedupe: the picker needs distinct rows.
 */
export function filterImportedCommits(
  commits: ImportedCommit[],
): ImportedCommit[] {
  const result: ImportedCommit[] = [];

  for (const commit of commits) {
    const message = commitSubject(commit.message);
    if (isNoiseCommitSubject(message)) continue;
    result.push({
      sha: commit.sha,
      message,
      date: commit.date,
    });
  }

  return result;
}

/**
 * Build generator input from selected subjects (dedupe identical lines).
 */
export function messagesForGenerator(messages: string[]): string {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const message of messages) {
    const subject = commitSubject(message);
    if (isNoiseCommitSubject(subject)) continue;
    const key = subject.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(subject);
  }

  return lines.join("\n");
}

/**
 * Normalize imported commit messages for the generator:
 * subject line only, drop merge noise, dedupe identical subjects.
 */
export function normalizeImportedCommitMessages(messages: string[]): string[] {
  return messagesForGenerator(messages).split("\n").filter(Boolean);
}
