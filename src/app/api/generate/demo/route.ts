import { generateText, Output } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";
import { generationSchema } from "@/lib/ai/schema";
import { parseGenerationRequest } from "@/lib/generation/parse-request";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

const DEMO_LIMIT = 3;
const DEMO_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const rate = checkRateLimit(`demo:${ip}`, DEMO_LIMIT, DEMO_WINDOW_MS);

  if (!rate.allowed) {
    return Response.json(
      {
        error: `Demo limit reached. Try again in ${rate.retryAfterSeconds ?? 60} seconds, or create a free account.`,
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseGenerationRequest(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!getAiProvider()) {
    return Response.json(
      {
        error:
          "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY or AI_GATEWAY_API_KEY.",
      },
      { status: 503 },
    );
  }

  const { commits, tone, options, referencePatch } = parsed.data;

  try {
    const { output } = await generateText({
      model: getGenerationModel(),
      system: getSystemPrompt(tone, options),
      prompt: getUserPrompt(commits, tone, referencePatch),
      output: Output.object({ schema: generationSchema }),
    });

    return Response.json({
      markdown: output?.markdown ?? "",
      socialPost: output?.socialPost ?? "",
      demo: true,
    });
  } catch (error) {
    console.error("[/api/generate/demo]", error);
    return Response.json(
      { error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}
