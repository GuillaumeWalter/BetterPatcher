import { generateText, Output } from "ai";

import { auth } from "@/auth";
import { getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { generationSchema } from "@/lib/ai/schema";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";
import { savePatchNote } from "@/lib/supabase/patch-notes";

const VALID_TONES = new Set(TONE_OPTIONS.map((option) => option.value));

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && VALID_TONES.has(value as Tone);
}

export async function POST(request: Request) {
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

  if (commits.length > 50_000) {
    return Response.json(
      { error: "Trop de contenu (50 000 caractères max)." },
      { status: 400 },
    );
  }

  try {
    const { output } = await generateText({
      model: getGenerationModel(),
      system: getSystemPrompt(tone),
      prompt: `Transforme ces messages de commit en patch note :\n\n${commits}`,
      output: Output.object({ schema: generationSchema }),
    });

    const session = await auth();

    const savedId =
      session?.user?.id && output
        ? await savePatchNote({
            userId: session.user.id,
            userEmail: session.user.email,
            tone,
            commitsRaw: commits,
            markdown: output.markdown,
            socialPost: output.socialPost,
            repoFullName,
          })
        : null;

    return Response.json({
      ...output,
      savedId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue.";

    const isAuthError =
      message.includes("API key") ||
      message.includes("authentication") ||
      message.includes("Unauthorized");

    const needsBilling =
      message.includes("credit card") ||
      message.includes("customer_verification_required");

    console.error("[/api/generate]", error);

    return Response.json(
      {
        error: isAuthError
          ? "Clé AI Gateway manquante ou invalide. Configurez AI_GATEWAY_API_KEY."
          : needsBilling
            ? "Vercel AI Gateway : ajoutez une carte bancaire sur votre compte Vercel pour activer les crédits IA gratuits (Settings → Billing)."
            : "La génération a échoué. Réessayez dans un instant.",
      },
      { status: isAuthError ? 503 : needsBilling ? 402 : 500 },
    );
  }
}
