import { auth } from "@/auth";
import { BILLING } from "@/lib/billing/constants";
import { runGeneration, normalizeGenerationOutput } from "@/lib/generation/run-generation";
import { resolveTicketsForGeneration } from "@/lib/generation/resolve-tickets";
import { parseGenerationRequest } from "@/lib/generation/parse-request";
import { getAiProvider } from "@/lib/ai/model";
import {
  maybeSendPaidPlanLifecycleEmails,
  maybeSendTrialLifecycleEmails,
} from "@/lib/email";
import { captureException } from "@/lib/monitoring";
import { savePatchNote } from "@/lib/supabase/patch-notes";
import { replacePlatformDrafts } from "@/lib/supabase/platform-drafts";
import {
  consumeGeneration,
  getUserProfile,
  getUserQuota,
  refundGeneration,
} from "@/lib/supabase/users";

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

  const parsed = parseGenerationRequest(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const { commits, tone, options, referencePatch, repoFullName } = parsed.data;

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
    const { ticketContext, resolution } = await resolveTicketsForGeneration({
      userId: session.user.id,
      commits,
      plan: consumed.plan,
    });

    const output = await runGeneration({
      commits,
      tone,
      options,
      referencePatch,
      ticketContext,
    });

    if (!output) {
      throw new Error("Empty generation result.");
    }

    const normalized = normalizeGenerationOutput(output, tone)!;

    const savedId = await savePatchNote({
      userId: session.user.id,
      userEmail: session.user.email,
      tone,
      commitsRaw: commits,
      markdown: normalized.markdown,
      socialPost: normalized.socialPost,
      repoFullName: repoFullName ?? null,
    });

    if (savedId && normalized.platformDrafts.length > 0) {
      await replacePlatformDrafts(savedId, normalized.platformDrafts);
    }

    const updatedQuota = await getUserQuota(session.user.id);
    const profile = await getUserProfile(session.user.id);

    if (session.user.email) {
      if (consumed.plan === "trial") {
        await maybeSendTrialLifecycleEmails({
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          plan: consumed.plan,
          generationsRemaining: consumed.generationsRemaining,
        });
      }

      if (
        updatedQuota &&
        (consumed.plan === "solo" || consumed.plan === "pro")
      ) {
        await maybeSendPaidPlanLifecycleEmails({
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          plan: consumed.plan,
          generationsUsed: updatedQuota.generationsUsed,
          generationsLimit: updatedQuota.generationsLimit,
          generationsRemaining: updatedQuota.generationsRemaining,
          billingPeriodStart: profile?.billingPeriodStart,
        });
      }
    }

    return Response.json({
      ...normalized,
      savedId,
      quota: updatedQuota,
      generationsRemaining: consumed.generationsRemaining,
      tickets: resolution,
    });
  } catch (error) {
    await refundGeneration(session.user.id, consumed.plan);
    captureException(error, { route: "/api/generate", userId: session.user.id });
    console.error("[/api/generate]", error);

    return Response.json(
      { error: "Generation failed. Try again in a moment." },
      { status: 500 },
    );
  }
}
