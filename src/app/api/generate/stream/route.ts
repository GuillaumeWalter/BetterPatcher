import { auth } from "@/auth";
import { BILLING } from "@/lib/billing/constants";
import {
  createGenerationStream,
  normalizeGenerationOutput,
} from "@/lib/generation/run-generation";
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
      return `Trial ended (${BILLING.TRIAL_GENERATIONS} generations). Upgrade to Solo or Pro.`;
    case "quota_exceeded":
      return "Monthly quota reached. Resets next cycle, or upgrade for more generations.";
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

  const { commits, tone, options, referencePatch, repoFullName } = parsed.data;
  const encoder = new TextEncoder();

  try {
    const { ticketContext, resolution } = await resolveTicketsForGeneration({
      userId: session.user.id,
      commits,
      plan: consumed.plan,
    });

    const result = createGenerationStream({
      commits,
      tone,
      options,
      referencePatch,
      ticketContext,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const partial of result.partialObjectStream) {
            const normalized = normalizeGenerationOutput(partial, tone);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "partial", data: normalized }) + "\n",
              ),
            );
          }

          const finalOutput = normalizeGenerationOutput(
            await result.object,
            tone,
          );

          if (!finalOutput) {
            throw new Error("Empty generation result.");
          }

          const savedId = await savePatchNote({
            userId: session.user!.id!,
            userEmail: session.user!.email,
            tone,
            commitsRaw: commits,
            markdown: finalOutput.markdown,
            socialPost: finalOutput.socialPost,
            repoFullName: repoFullName ?? null,
          });

          if (savedId && finalOutput.platformDrafts.length > 0) {
            await replacePlatformDrafts(savedId, finalOutput.platformDrafts);
          }

          const updatedQuota = await getUserQuota(session.user!.id!);
          const profile = await getUserProfile(session.user!.id!);

          if (session.user!.email) {
            if (consumed.plan === "trial") {
              await maybeSendTrialLifecycleEmails({
                userId: session.user!.id!,
                email: session.user!.email,
                name: session.user!.name,
                plan: consumed.plan,
                generationsRemaining: consumed.generationsRemaining,
              });
            }

            if (
              updatedQuota &&
              (consumed.plan === "solo" || consumed.plan === "pro")
            ) {
              await maybeSendPaidPlanLifecycleEmails({
                userId: session.user!.id!,
                email: session.user!.email,
                name: session.user!.name,
                plan: consumed.plan,
                generationsUsed: updatedQuota.generationsUsed,
                generationsLimit: updatedQuota.generationsLimit,
                generationsRemaining: updatedQuota.generationsRemaining,
                billingPeriodStart: profile?.billingPeriodStart,
              });
            }
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "done",
                data: {
                  ...finalOutput,
                  savedId,
                  quota: updatedQuota,
                  generationsRemaining: consumed.generationsRemaining,
                  tickets: resolution,
                },
              }) + "\n",
            ),
          );
          controller.close();
        } catch (error) {
          await refundGeneration(session.user!.id!, consumed.plan);
          captureException(error, {
            route: "/api/generate/stream",
            userId: session.user!.id,
          });
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: "Generation failed. Try again in a moment.",
              }) + "\n",
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    await refundGeneration(session.user.id, consumed.plan);
    captureException(error, {
      route: "/api/generate/stream",
      userId: session.user.id,
    });
    return Response.json(
      { error: "Generation failed. Try again in a moment." },
      { status: 500 },
    );
  }
}
