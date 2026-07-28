import { auth } from "@/auth";
import {
  type PaidPlanTier,
} from "@/lib/billing/constants";
import { getStripeProPriceId, getStripeSoloPriceId } from "@/lib/env";
import { getAppBaseUrl, getOrCreateStripeCustomer, getStripe } from "@/lib/stripe";
import { ensureUserProfile, getUserQuota } from "@/lib/supabase/users";

function parsePaidPlan(value: unknown): PaidPlanTier | null {
  if (value === "solo" || value === "pro") return value;
  return null;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401);
    }

    await ensureUserProfile({
      userId: session.user.id,
      email: session.user.email ?? null,
    });

    const quota = await getUserQuota(session.user.id);

    if (!quota) {
      return jsonError("User profile not found.", 404);
    }

    return Response.json(quota);
  } catch (error) {
    console.error("[billing GET]", error);
    return jsonError("Could not load billing status.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Sign in required. Sign out and sign in again, then retry.", 401);
    }

    await ensureUserProfile({
      userId: session.user.id,
      email: session.user.email ?? null,
    });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const action =
      typeof body === "object" &&
      body !== null &&
      "action" in body &&
      typeof body.action === "string"
        ? body.action
        : "setup";

    const stripe = getStripe();
    if (!stripe) {
      return jsonError("Stripe is not configured (STRIPE_SECRET_KEY).", 503);
    }

    const customerId = await getOrCreateStripeCustomer({
      userId: session.user.id,
      email: session.user.email ?? null,
    });

    if (!customerId) {
      return jsonError("Could not create the Stripe customer.", 500);
    }

    const baseUrl = getAppBaseUrl();

    if (action === "subscribe") {
      const plan =
        typeof body === "object" && body !== null && "plan" in body
          ? parsePaidPlan(body.plan)
          : null;

      if (!plan) {
        return jsonError("Invalid plan. Choose solo or pro.", 400);
      }

      const priceId =
        plan === "solo" ? getStripeSoloPriceId() : getStripeProPriceId();

      if (!priceId) {
        return jsonError(
          plan === "solo"
            ? "STRIPE_SOLO_PRICE_ID is missing."
            : "STRIPE_PRO_PRICE_ID is missing.",
          503,
        );
      }

      const quota = await getUserQuota(session.user.id);
      if (quota?.requiresSetup) {
        return jsonError("Verify your card first.", 400);
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard/billing?success=1`,
        cancel_url: `${baseUrl}/dashboard/billing?canceled=1`,
        metadata: {
          userId: session.user.id,
          planTier: plan,
        },
      });

      if (!checkoutSession.url) {
        return jsonError("Stripe did not return a checkout URL.", 502);
      }

      return Response.json({ url: checkoutSession.url });
    }

    // Setup mode requires currency when using Dashboard dynamic payment methods
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "setup",
      currency: "eur",
      customer: customerId,
      success_url: `${baseUrl}/onboarding?setup=success`,
      cancel_url: `${baseUrl}/onboarding?setup=canceled`,
      metadata: {
        userId: session.user.id,
      },
    });

    if (!checkoutSession.url) {
      return jsonError("Stripe did not return a checkout URL.", 502);
    }

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[billing POST]", error);
    const message =
      error instanceof Error ? error.message : "Billing request failed.";
    return jsonError(message, 500);
  }
}
