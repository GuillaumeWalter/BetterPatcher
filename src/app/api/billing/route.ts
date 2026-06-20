import { auth } from "@/auth";
import { getAppBaseUrl, getOrCreateStripeCustomer, getStripe } from "@/lib/stripe";
import { getUserQuota } from "@/lib/supabase/users";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  }

  const quota = await getUserQuota(session.user.id);

  if (!quota) {
    return Response.json(
      { error: "Profil utilisateur introuvable." },
      { status: 404 },
    );
  }

  return Response.json(quota);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Connexion requise." }, { status: 401 });
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
      { error: "Stripe non configuré (STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const customerId = await getOrCreateStripeCustomer({
    userId: session.user.id,
    email: session.user.email ?? null,
  });

  if (!customerId) {
    return Response.json(
      { error: "Impossible de créer le client Stripe." },
      { status: 500 },
    );
  }

  const baseUrl = getAppBaseUrl();

  if (action === "subscribe") {
    const priceId = process.env.STRIPE_PRO_PRICE_ID?.trim();
    if (!priceId) {
      return Response.json(
        { error: "STRIPE_PRO_PRICE_ID manquant." },
        { status: 503 },
      );
    }

    const quota = await getUserQuota(session.user.id);
    if (quota?.requiresSetup) {
      return Response.json(
        { error: "Vérifiez d'abord votre carte bancaire." },
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
