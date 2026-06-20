const DEFAULT_MODEL = "anthropic/claude-sonnet-4.6";

export function getGenerationModel(): string {
  return process.env.AI_GATEWAY_MODEL?.trim() || DEFAULT_MODEL;
}
