import { getAiProvider } from "@/lib/ai/model";

/** Diagnostic — dev libre ; prod protégé par ENV_CHECK_SECRET (?secret=). */
export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const secret = process.env.ENV_CHECK_SECRET?.trim();
  const provided = new URL(request.url).searchParams.get("secret");

  if (!isDev && (!secret || provided !== secret)) {
    return Response.json({ error: "Non trouvé." }, { status: 404 });
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
    },
    stripe: {
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
      STRIPE_PRO_PRICE_ID: Boolean(process.env.STRIPE_PRO_PRICE_ID?.trim()),
    },
    supabase: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      ),
    },
  });
}
