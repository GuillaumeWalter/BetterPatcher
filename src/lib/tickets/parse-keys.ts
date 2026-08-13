/** Parse issue keys from commit messages (Linear, Jira, etc.). */

const TICKET_KEY_PATTERN = /\b([A-Z][A-Z0-9]{1,9}-\d+)\b/g;

const IGNORE_KEYS = new Set([
  "UTF-8",
  "ISO-8859",
]);

export function parseTicketKeys(text: string, maxKeys = 15): string[] {
  const matches = text.match(TICKET_KEY_PATTERN) ?? [];
  const unique: string[] = [];

  for (const raw of matches) {
    const key = raw.toUpperCase();
    if (IGNORE_KEYS.has(key)) continue;
    if (unique.includes(key)) continue;
    unique.push(key);
    if (unique.length >= maxKeys) break;
  }

  return unique;
}
