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

/**
 * Normalize imported commit messages for the generator:
 * subject line only, drop merge noise, dedupe identical subjects.
 */
export function normalizeImportedCommitMessages(messages: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const message of messages) {
    const subject = commitSubject(message);
    if (isNoiseCommitSubject(subject)) continue;

    const key = subject.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(subject);
  }

  return result;
}
