const STORAGE_KEY = "easy-patch:reference-patches:v1";
const MAX_SAVED = 6;
const MAX_LABEL = 48;

export type SavedReferencePatch = {
  id: string;
  label: string;
  body: string;
  updatedAt: string;
};

function readAll(): SavedReferencePatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReferencePatch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: SavedReferencePatch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_SAVED)));
}

function makeLabel(body: string): string {
  const firstLine =
    body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? "Reference patch";
  const cleaned = firstLine.replace(/^#+\s*/, "");
  if (cleaned.length <= MAX_LABEL) return cleaned;
  return `${cleaned.slice(0, MAX_LABEL - 1)}…`;
}

export function listReferencePatches(): SavedReferencePatch[] {
  return readAll();
}

export function saveReferencePatch(body: string, label?: string): SavedReferencePatch[] {
  const trimmed = body.trim();
  if (!trimmed) return readAll();

  const entry: SavedReferencePatch = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: (label?.trim() || makeLabel(trimmed)).slice(0, MAX_LABEL),
    body: trimmed,
    updatedAt: new Date().toISOString(),
  };

  const withoutDupes = readAll().filter(
    (item) => item.body.trim() !== trimmed,
  );
  writeAll([entry, ...withoutDupes]);
  return readAll();
}

export function removeReferencePatch(id: string): SavedReferencePatch[] {
  writeAll(readAll().filter((item) => item.id !== id));
  return readAll();
}
