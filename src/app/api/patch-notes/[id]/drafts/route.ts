import { auth } from "@/auth";
import { generateText, Output } from "ai";

import { getAiProvider, getGenerationModel } from "@/lib/ai/model";
import { getPlatformRegeneratePrompt } from "@/lib/ai/prompts";
import { singlePlatformDraftSchema } from "@/lib/ai/schema";
import {
  DEFAULT_GENERATION_OPTIONS,
  parseGenerationOptions,
} from "@/lib/constants";
import { RATE_LIMITS } from "@/lib/rate-limit-config";
import { checkRateLimitDurable } from "@/lib/rate-limit-durable";
import {
  isSharePlatform,
  SHARE_PLATFORMS,
  type SharePlatform,
} from "@/lib/share/platforms";
import { getPatchNoteForUser } from "@/lib/supabase/patch-notes";
import {
  listPlatformDraftsForPatchNote,
  updatePlatformDraftBody,
  upsertPlatformDraft,
} from "@/lib/supabase/platform-drafts";
import type { PatchNoteRow } from "@/lib/supabase/patch-notes";

type RouteContext = { params: Promise<{ id: string }> };

async function regeneratePlatformDraft(input: {
  note: PatchNoteRow;
  patchNoteId: string;
  platform: SharePlatform;
  instruction: string;
  options: ReturnType<typeof parseGenerationOptions>;
}) {
  const { output } = await generateText({
    model: getGenerationModel(),
    system: getPlatformRegeneratePrompt(
      input.note.tone,
      input.platform,
      input.options,
    ),
    prompt: [
      `Patch note markdown:\n\n${input.note.markdown}`,
      input.instruction
        ? `\nUser instruction for this rewrite:\n${input.instruction}`
        : "",
      `\nRewrite the draft for platform: ${input.platform}.`,
    ].join(""),
    output: Output.object({ schema: singlePlatformDraftSchema }),
  });

  if (!output?.body?.trim()) {
    throw new Error(`Regeneration returned an empty draft for ${input.platform}.`);
  }

  const draft = {
    platform: input.platform,
    title: output.title?.trim() ?? "",
    body: output.body.trim(),
  };

  await upsertPlatformDraft(input.patchNoteId, draft);
  return draft;
}

function regenerateRateLimitResponse(rate: {
  retryAfterSeconds?: number;
  remaining: number;
  limit: number;
}) {
  const retry = rate.retryAfterSeconds ?? 60;
  return Response.json(
    {
      error: `Draft regeneration limit reached (${rate.limit}/hour). Try again in ${retry} seconds.`,
      remaining: rate.remaining,
      limit: rate.limit,
      retryAfterSeconds: retry,
    },
    { status: 429 },
  );
}

async function assertRegenerateQuota(userId: string, increment: number) {
  const rate = await checkRateLimitDurable(
    `regenerate:${userId}`,
    RATE_LIMITS.REGENERATE_PER_USER_HOUR,
    RATE_LIMITS.REGENERATE_WINDOW_MS,
    increment,
  );

  if (!rate.allowed) {
    return regenerateRateLimitResponse(rate);
  }

  return null;
}

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

  if (note.user_id !== session.user.id) {
    return Response.json(
      { error: "Only the author can edit drafts." },
      { status: 403 },
    );
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

  if (note.user_id !== session.user.id) {
    return Response.json(
      { error: "Only the author can edit drafts." },
      { status: 403 },
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action =
    typeof body === "object" &&
    body !== null &&
    "action" in body &&
    typeof body.action === "string"
      ? body.action
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

  if (action === "regenerate_all") {
    const rawPlatforms =
      typeof body === "object" &&
      body !== null &&
      "platforms" in body &&
      Array.isArray(body.platforms)
        ? body.platforms
        : [...SHARE_PLATFORMS];

    const platforms = rawPlatforms.filter(
      (value): value is SharePlatform =>
        typeof value === "string" && isSharePlatform(value),
    );

    if (platforms.length === 0) {
      return Response.json({ error: "No valid platforms." }, { status: 400 });
    }

    const quotaError = await assertRegenerateQuota(
      session.user.id,
      platforms.length,
    );
    if (quotaError) return quotaError;

    try {
      const drafts = [];
      for (const platform of platforms) {
        const draft = await regeneratePlatformDraft({
          note,
          patchNoteId: id,
          platform,
          instruction,
          options,
        });
        drafts.push(draft);
      }
      return Response.json({ drafts });
    } catch (error) {
      console.error("[/api/patch-notes/:id/drafts POST regenerate_all]", error);
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not regenerate all drafts.",
        },
        { status: 500 },
      );
    }
  }

  const platform: SharePlatform | null =
    typeof body === "object" &&
    body !== null &&
    "platform" in body &&
    isSharePlatform(body.platform)
      ? body.platform
      : null;

  if (!platform) {
    return Response.json({ error: "Invalid platform." }, { status: 400 });
  }

  const quotaError = await assertRegenerateQuota(session.user.id, 1);
  if (quotaError) return quotaError;

  try {
    const draft = await regeneratePlatformDraft({
      note,
      patchNoteId: id,
      platform,
      instruction,
      options,
    });

    return Response.json({ draft });
  } catch (error) {
    console.error("[/api/patch-notes/:id/drafts POST]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not regenerate this draft.",
      },
      { status: 500 },
    );
  }
}
