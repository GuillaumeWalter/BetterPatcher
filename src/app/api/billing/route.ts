import { auth } from "@/auth";
import {
  type PaidPlanTier,
} from "@/lib/billing/constants";
import { getStripeProPriceId, getStripeSoloPriceId } from "@/lib/env";
import { getAppBaseUrl, getOrCreateStripeCustomer, getStripe } from "@/lib/stripe";
import { getUserQuota } from "@/lib/supabase/users";

function parsePaidPlan(value: unknown): PaidPlanTier | null {
  if (value === "solo" || value === "pro") return value;
  return null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  const quota = await getUserQuota(session.user.id);

  if (!quota) {
    return Response.json(
      { error: "User profile not found." },
      { status: 404 },
    );
  }

  return Response.json(quota);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

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
    return Response.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const customerId = await getOrCreateStripeCustomer({
    userId: session.user.id,
    email: session.user.email ?? null,
  });

  if (!customerId) {
    return Response.json(
      { error: "Could not create the Stripe customer." },
      { status: 500 },
    );
  }

  const baseUrl = getAppBaseUrl();

  if (action === "subscribe") {
    const plan =
      typeof body === "object" && body !== null && "plan" in body
        ? parsePaidPlan(body.plan)
        : null;

    if (!plan) {
      return Response.json(
        { error: "Invalid plan. Choose solo or pro." },
        { status: 400 },
      );
    }

    const priceId =
      plan === "solo" ? getStripeSoloPriceId() : getStripeProPriceId();

    if (!priceId) {
      return Response.json(
        {
          error:
            plan === "solo"
              ? "STRIPE_SOLO_PRICE_ID is missing."
              : "STRIPE_PRO_PRICE_ID is missing.",
        },
        { status: 503 },
      );
    }

    const quota = await getUserQuota(session.user.id);
    if (quota?.requiresSetup) {
      return Response.json(
        { error: "Verify your card first." },
        { status: 400 },
      );
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

    return Response.json({ url: checkoutSession.url });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: customerId,
    success_url: `${baseUrl}/onboarding?setup=success`,
    cancel_url: `${baseUrl}/onboarding?setup=canceled`,
    metadata: {
      userId: session.user.id,
    },
  });

  return Response.json({ url: checkoutSession.url });
}
