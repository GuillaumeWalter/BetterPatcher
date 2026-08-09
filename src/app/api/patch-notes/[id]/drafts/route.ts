import { auth } from "@/auth";
import { generateText, Output } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getPlatformRegeneratePrompt } from "@/lib/ai/prompts";
import { singlePlatformDraftSchema } from "@/lib/ai/schema";
import {
  DEFAULT_GENERATION_OPTIONS,
  parseGenerationOptions,
} from "@/lib/constants";
import { isSharePlatform, type SharePlatform } from "@/lib/share/platforms";
import { getPatchNoteForUser } from "@/lib/supabase/patch-notes";
import {
  listPlatformDraftsForPatchNote,
  updatePlatformDraftBody,
  upsertPlatformDraft,
} from "@/lib/supabase/platform-drafts";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const note = await getPatchNoteForUser(session.user.id, id);
  if (!note) {
    return Response.json({ error: "Patch note not found." }, { status: 404 });
  }

  const drafts = await listPlatformDraftsForPatchNote(id);
  return Response.json({ drafts });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const note = await getPatchNoteForUser(session.user.id, id);
  if (!note) {
    return Response.json({ error: "Patch note not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const platform =
    typeof body === "object" &&
    body !== null &&
    "platform" in body &&
    isSharePlatform(body.platform)
      ? body.platform
      : null;

  const draftBody =
    typeof body === "object" &&
    body !== null &&
    "body" in body &&
    typeof body.body === "string"
      ? body.body
      : undefined;

  const title =
    typeof body === "object" &&
    body !== null &&
    "title" in body &&
    typeof body.title === "string"
      ? body.title
      : undefined;

  if (!platform || (draftBody === undefined && title === undefined)) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const existing = await listPlatformDraftsForPatchNote(id);
  const current = existing.find((draft) => draft.platform === platform);

  if (!current) {
    const ok = await upsertPlatformDraft(id, {
      platform,
      title: title ?? "",
      body: draftBody ?? "",
    });
    if (!ok) {
      return Response.json({ error: "Could not save draft." }, { status: 500 });
    }
  } else {
    const ok = await updatePlatformDraftBody(id, platform, {
      title,
      body: draftBody,
    });
    if (!ok) {
      return Response.json({ error: "Could not save draft." }, { status: 500 });
    }
  }

  return Response.json({ success: true });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const note = await getPatchNoteForUser(session.user.id, id);
  if (!note) {
    return Response.json({ error: "Patch note not found." }, { status: 404 });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const platform: SharePlatform | null =
    typeof body === "object" &&
    body !== null &&
    "platform" in body &&
    isSharePlatform(body.platform)
      ? body.platform
      : null;

  const instruction =
    typeof body === "object" &&
    body !== null &&
    "instruction" in body &&
    typeof body.instruction === "string"
      ? body.instruction.trim()
      : "";

  const options =
    typeof body === "object" && body !== null && "options" in body
      ? parseGenerationOptions(body.options)
      : DEFAULT_GENERATION_OPTIONS;

  if (!platform) {
    return Response.json({ error: "Invalid platform." }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: getGenerationModel(),
      system: getPlatformRegeneratePrompt(note.tone, platform, options),
      prompt: [
        `Patch note markdown:\n\n${note.markdown}`,
        instruction
          ? `\nUser instruction for this rewrite:\n${instruction}`
          : "",
        `\nRewrite the draft for platform: ${platform}.`,
      ].join(""),
      output: Output.object({ schema: singlePlatformDraftSchema }),
    });

    if (!output?.body?.trim()) {
      return Response.json(
        { error: "Regeneration returned an empty draft." },
        { status: 502 },
      );
    }

    const draft = {
      platform,
      title: output.title?.trim() ?? "",
      body: output.body.trim(),
    };

    await upsertPlatformDraft(id, draft);

    return Response.json({ draft });
  } catch (error) {
    console.error("[/api/patch-notes/:id/drafts POST]", error);
    return Response.json(
      { error: "Could not regenerate this draft." },
      { status: 500 },
    );
  }
}
