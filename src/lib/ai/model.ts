import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

const DEFAULT_GOOGLE_MODEL = "gemini-2.5-flash";
const DEFAULT_GATEWAY_MODEL = "google/gemini-2.5-flash";

export type AiProvider = "google" | "gateway";

export function getAiProvider(): AiProvider | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    return "google";
  }
  if (process.env.AI_GATEWAY_API_KEY?.trim()) {
    return "gateway";
  }
  return null;
}

export function getGenerationModel(): LanguageModel | string {
  if (getAiProvider() === "google") {
    const modelId =
      process.env.GOOGLE_MODEL?.trim() || DEFAULT_GOOGLE_MODEL;
    return google(modelId);
  }

  return process.env.AI_GATEWAY_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
}
