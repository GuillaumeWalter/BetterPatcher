import { getAiProvider } from "@/lib/ai/model";
import { runGeneration } from "@/lib/generation/run-generation";
import { parseGenerationRequest } from "@/lib/generation/parse-request";
import { RATE_LIMITS } from "@/lib/rate-limit-config";
import {
  checkRateLimitDurable,
  peekRateLimitDurable,
} from "@/lib/rate-limit-durable";
import { getRequestIp } from "@/lib/rate-limit";

const DEMO_LIMIT = RATE_LIMITS.DEMO_PER_IP_HOUR;
const DEMO_WINDOW_MS = RATE_LIMITS.DEMO_WINDOW_MS;

export async function GET(request: Request) {
  const ip = getRequestIp(request);
  const status = await peekRateLimitDurable(`demo:${ip}`, DEMO_LIMIT);
  return Response.json({
    limit: status.limit,
    remaining: status.remaining,
    windowHours: DEMO_WINDOW_MS / 3_600_000,
  });
}

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const rate = await checkRateLimitDurable(
    `demo:${ip}`,
    DEMO_LIMIT,
    DEMO_WINDOW_MS,
  );

  if (!rate.allowed) {
    return Response.json(
      {
        error: `Demo limit reached. Try again in ${rate.retryAfterSeconds ?? 60} seconds, or create a free account.`,
        remaining: 0,
        limit: rate.limit,
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
    const output = await runGeneration({
      commits,
      tone,
      options,
      referencePatch,
    });

    return Response.json({
      markdown: output?.markdown ?? "",
      socialPost: output?.socialPost ?? "",
      demo: true,
      remaining: rate.remaining,
      limit: rate.limit,
    });
  } catch (error) {
    console.error("[/api/generate/demo]", error);
    return Response.json(
      { error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}
