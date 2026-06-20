const DEFAULT_MODEL = "google/gemini-2.5-flash";

export function getGenerationModel(): string {
  return process.env.AI_GATEWAY_MODEL?.trim() || DEFAULT_MODEL;
}
