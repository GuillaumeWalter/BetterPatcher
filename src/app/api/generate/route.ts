import { auth } from "@/auth";
import { generateText, Output } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";
import { generationSchema } from "@/lib/ai/schema";
import { BILLING } from "@/lib/billing/constants";
import {
  TONE_OPTIONS,
  parseGenerationOptions,
  type Tone,
} from "@/lib/constants";
import { savePatchNote } from "@/lib/supabase/patch-notes";
import {
  consumeGeneration,
  getUserQuota,
  refundGeneration,
} from "@/lib/supabase/users";

const VALID_TONES = new Set(TONE_OPTIONS.map((option) => option.value));

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && VALID_TONES.has(value as Tone);
}

function quotaErrorMessage(code: string) {
  switch (code) {
    case "setup_required":
      return "Add your card (€0) to activate your trial.";
    case "subscription_required":
      return `Trial ended (${BILLING.TRIAL_GENERATIONS} generations). Upgrade to Solo (${BILLING.SOLO_PRICE_LABEL}) or Pro (${BILLING.PRO_PRICE_LABEL}).`;
    case "quota_exceeded":
      return "Monthly quota reached. Resets next cycle, or upgrade to Pro for more generations.";
    case "rate_limited":
      return `Wait ${BILLING.MIN_SECONDS_BETWEEN_GENERATIONS} seconds between generations.`;
    default:
      return "Generation is unavailable for your account.";
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Create an account to generate patch notes." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

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

  const repoFullName =
    typeof body === "object" &&
    body !== null &&
    "repoFullName" in body &&
    typeof body.repoFullName === "string"
      ? body.repoFullName.trim() || null
      : null;

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
      : "";

  if (!commits) {
    return Response.json(
      { error: "The commits field is required." },
      { status: 400 },
    );
  }

  if (!isTone(tone)) {
    return Response.json(
      { error: "Invalid tone." },
      { status: 400 },
    );
  }

  if (commits.length > BILLING.MAX_COMMITS_CHARS) {
    return Response.json(
      {
        error: `Too much content (${BILLING.MAX_COMMITS_CHARS.toLocaleString("en-US")} characters max).`,
      },
      { status: 400 },
    );
  }

  const lineCount = commits.split("\n").filter((line) => line.trim()).length;
  if (lineCount > BILLING.MAX_COMMIT_LINES) {
    return Response.json(
      {
        error: `Too many commits (${BILLING.MAX_COMMIT_LINES} lines max). Narrow your selection.`,
      },
      { status: 400 },
    );
  }

  if (referencePatch.length > BILLING.MAX_REFERENCE_CHARS) {
    return Response.json(
      {
        error: `Reference patch is too long (${BILLING.MAX_REFERENCE_CHARS.toLocaleString("en-US")} characters max).`,
      },
      { status: 400 },
    );
  }

  if (!getAiProvider()) {
    return Response.json(
      {
        error:
          "No AI key configured. Add GOOGLE_GENERATIVE_AI_API_KEY or AI_GATEWAY_API_KEY.",
      },
      { status: 503 },
    );
  }

  const consumed = await consumeGeneration(session.user.id);
  if (!consumed.ok) {
    return Response.json(
      {
        error: quotaErrorMessage(consumed.code),
        code: consumed.code,
      },
      { status: consumed.code === "rate_limited" ? 429 : 402 },
    );
  }

  try {
    const { output } = await generateText({
      model: getGenerationModel(),
      system: getSystemPrompt(tone, options, referencePatch || null),
      prompt: getUserPrompt(commits, tone, referencePatch || null),
      output: Output.object({ schema: generationSchema }),
    });

    const savedId =
      output &&
      (await savePatchNote({
        userId: session.user.id,
        userEmail: session.user.email,
        tone,
        commitsRaw: commits,
        markdown: output.markdown,
        socialPost: output.socialPost,
        repoFullName,
      }));

    const updatedQuota = await getUserQuota(session.user.id);

    return Response.json({
      ...output,
      savedId,
      quota: updatedQuota,
      generationsRemaining: consumed.generationsRemaining,
    });
  } catch (error) {
    await refundGeneration(session.user.id, consumed.plan);
    console.error("[/api/generate]", error);

    return Response.json(
      { error: "Generation failed. Try again in a moment." },
      { status: 500 },
    );
  }
}
