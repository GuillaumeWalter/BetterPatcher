import { getPreferenceValues } from "@raycast/api";

export type Preferences = {
  userId: string;
  token: string;
  baseUrl?: string;
  defaultTone?: "technical" | "marketing" | "gaming";
};

export type GenerateResult = {
  ok: boolean;
  markdown?: string;
  socialPost?: string;
  historyUrl?: string;
  error?: string;
  generationsRemaining?: number;
};

export function preferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

export async function generatePatchNote(input: {
  commits: string;
  tone?: string;
}): Promise<GenerateResult> {
  const prefs = preferences();
  const baseUrl = (prefs.baseUrl || "https://easypatch.app").replace(/\/$/, "");
  const tone = input.tone || prefs.defaultTone || "technical";

  const response = await fetch(`${baseUrl}/api/action/generate`, {
    method: "POST",
    headers: {
      Authorization: `EasyPatch ${prefs.userId}:${prefs.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commits: input.commits.trim(),
      tone,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GenerateResult & {
    error?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      error: data.error || `API error (${response.status})`,
    };
  }

  return {
    ok: true,
    markdown: data.markdown,
    socialPost: data.socialPost,
    historyUrl: data.historyUrl,
    generationsRemaining: data.generationsRemaining,
  };
}
