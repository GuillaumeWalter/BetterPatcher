import { auth } from "@/auth";
import { getAiProvider } from "@/lib/ai/model";

/** Signed-in diagnostic: which variables are present (not their values). */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const provider = getAiProvider();

  return Response.json({
    ai: {
      provider,
      GOOGLE_GENERATIVE_AI_API_KEY: Boolean(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
      ),
      AI_GATEWAY_API_KEY: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()),
    },
    auth: {
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET?.trim()),
      AUTH_GITHUB_ID: Boolean(process.env.AUTH_GITHUB_ID?.trim()),
      AUTH_GITHUB_SECRET: Boolean(process.env.AUTH_GITHUB_SECRET?.trim()),
      AUTH_GITLAB_ID: Boolean(process.env.AUTH_GITLAB_ID?.trim()),
      AUTH_GITLAB_SECRET: Boolean(process.env.AUTH_GITLAB_SECRET?.trim()),
    },
    stripe: {
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
      STRIPE_SOLO_PRICE_ID: Boolean(process.env.STRIPE_SOLO_PRICE_ID?.trim()),
      STRIPE_PRO_PRICE_ID: Boolean(process.env.STRIPE_PRO_PRICE_ID?.trim()),
      STRIPE_SOLO_PRICE_ID_USD: Boolean(
        process.env.STRIPE_SOLO_PRICE_ID_USD?.trim(),
      ),
      STRIPE_PRO_PRICE_ID_USD: Boolean(
        process.env.STRIPE_PRO_PRICE_ID_USD?.trim(),
      ),
      STRIPE_SOLO_PRICE_ID_GBP: Boolean(
        process.env.STRIPE_SOLO_PRICE_ID_GBP?.trim(),
      ),
      STRIPE_PRO_PRICE_ID_GBP: Boolean(
        process.env.STRIPE_PRO_PRICE_ID_GBP?.trim(),
      ),
      STRIPE_SOLO_PRICE_ID_JPY: Boolean(
        process.env.STRIPE_SOLO_PRICE_ID_JPY?.trim(),
      ),
      STRIPE_PRO_PRICE_ID_JPY: Boolean(
        process.env.STRIPE_PRO_PRICE_ID_JPY?.trim(),
      ),
      STRIPE_SOLO_PRICE_ID_KRW: Boolean(
        process.env.STRIPE_SOLO_PRICE_ID_KRW?.trim(),
      ),
      STRIPE_PRO_PRICE_ID_KRW: Boolean(
        process.env.STRIPE_PRO_PRICE_ID_KRW?.trim(),
      ),
    },
    supabase: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      ),
    },
  });
}
