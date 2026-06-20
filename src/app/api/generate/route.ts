import { auth } from "@/auth";
import { generateText, Output } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt } from "@/lib/ai/prompts";
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
      return "Ajoutez votre carte bancaire (0 €) pour activer votre essai.";
    case "subscription_required":
      return `Essai terminé (${BILLING.TRIAL_GENERATIONS} générations). Passez au plan Pro (${BILLING.PRO_PRICE_LABEL}).`;
    case "quota_exceeded":
      return `Quota mensuel atteint (${BILLING.PRO_MONTHLY_GENERATIONS} générations). Renouvellement au prochain cycle.`;
    case "rate_limited":
      return `Patientez ${BILLING.MIN_SECONDS_BETWEEN_GENERATIONS} secondes entre deux générations.`;
    default:
      return "Génération indisponible pour votre compte.";
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Créez un compte pour générer des patch notes." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
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

  if (!commits) {
    return Response.json(
      { error: "Le champ commits est requis." },
      { status: 400 },
    );
  }

  if (!isTone(tone)) {
    return Response.json(
      { error: "Tonalité invalide." },
      { status: 400 },
    );
  }

  if (commits.length > BILLING.MAX_COMMITS_CHARS) {
    return Response.json(
      {
        error: `Trop de contenu (${BILLING.MAX_COMMITS_CHARS.toLocaleString("fr-FR")} caractères max).`,
      },
      { status: 400 },
    );
  }

  const lineCount = commits.split("\n").filter((line) => line.trim()).length;
  if (lineCount > BILLING.MAX_COMMIT_LINES) {
    return Response.json(
      {
        error: `Trop de commits (${BILLING.MAX_COMMIT_LINES} lignes max). Réduisez la sélection.`,
      },
      { status: 400 },
    );
  }

  if (!getAiProvider()) {
    return Response.json(
      {
        error:
          "Aucune clé IA configurée. Ajoutez GOOGLE_GENERATIVE_AI_API_KEY ou AI_GATEWAY_API_KEY.",
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
      system: getSystemPrompt(tone, options),
      prompt: `Transforme ces messages de commit en patch note :\n\n${commits}`,
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

    const message =
      error instanceof Error ? error.message : "Erreur inconnue.";

    return Response.json(
      { error: "La génération a échoué. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
