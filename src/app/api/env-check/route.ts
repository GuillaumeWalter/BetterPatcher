import { getAiProvider } from "@/lib/ai/model";

/** Diagnostic prod — indique quelles variables sont présentes (pas leurs valeurs). */
export async function GET() {
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
