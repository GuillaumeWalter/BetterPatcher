import { BILLING } from "@/lib/billing/constants";
import {
  TONE_OPTIONS,
  parseGenerationOptions,
  type GenerationOptions,
  type Tone,
} from "@/lib/constants";

const VALID_TONES = new Set(TONE_OPTIONS.map((option) => option.value));

export type GenerationRequestInput = {
  commits: string;
  tone: Tone;
  options: GenerationOptions;
  referencePatch?: string;
  repoFullName?: string | null;
};

export type ParseGenerationResult =
  | { ok: true; data: GenerationRequestInput }
  | { ok: false; error: string; status: number };

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && VALID_TONES.has(value as Tone);
}

export function parseGenerationRequest(body: unknown): ParseGenerationResult {
  const commits =
    typeof body === "object" &&
    body !== null &&
    "commits" in body &&
    typeof body.commits === "string"
      ? body.commits.trim()
      : "";

  const tone =
    typeof body === "object" && body !== null && "tone" in body
      ? body.tone
      : undefined;

  const options =
    typeof body === "object" && body !== null && "options" in body
      ? parseGenerationOptions(body.options)
      : parseGenerationOptions(undefined);

  const referencePatch =
    typeof body === "object" &&
    body !== null &&
    "referencePatch" in body &&
    typeof body.referencePatch === "string"
      ? body.referencePatch.trim()
      : undefined;

  if (!commits) {
    return { ok: false, error: "The commits field is required.", status: 400 };
  }

  if (!isTone(tone)) {
    return { ok: false, error: "Invalid tone.", status: 400 };
  }

  if (commits.length > BILLING.MAX_COMMITS_CHARS) {
    return {
      ok: false,
      error: `Too much content (${BILLING.MAX_COMMITS_CHARS.toLocaleString("en-US")} characters max).`,
      status: 400,
    };
  }

  const lineCount = commits.split("\n").filter((line) => line.trim()).length;
  if (lineCount > BILLING.MAX_COMMIT_LINES) {
    return {
      ok: false,
      error: `Too many commits (${BILLING.MAX_COMMIT_LINES} lines max).`,
      status: 400,
    };
  }

  if (referencePatch && referencePatch.length > BILLING.MAX_REFERENCE_CHARS) {
    return {
      ok: false,
      error: `Style reference is too long (${BILLING.MAX_REFERENCE_CHARS.toLocaleString("en-US")} characters max).`,
      status: 400,
    };
  }

  const repoFullName =
    typeof body === "object" &&
    body !== null &&
    "repoFullName" in body &&
    typeof body.repoFullName === "string"
      ? body.repoFullName.trim() || null
      : null;

  return {
    ok: true,
    data: { commits, tone, options, referencePatch, repoFullName },
  };
}
