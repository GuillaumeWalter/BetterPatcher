import { generateText, Output } from "ai";

import { getGenerationModel } from "@/lib/ai/model";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { generationSchema } from "@/lib/ai/schema";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";

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

    return Response.json(output);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue.";

    const isAuthError =
      message.includes("API key") ||
      message.includes("authentication") ||
      message.includes("Unauthorized");

    console.error("[/api/generate]", error);

    return Response.json(
      {
        error: isAuthError
          ? "Clé AI Gateway manquante ou invalide. Configurez AI_GATEWAY_API_KEY."
          : "La génération a échoué. Réessayez dans un instant.",
      },
      { status: isAuthError ? 503 : 500 },
    );
  }
}
