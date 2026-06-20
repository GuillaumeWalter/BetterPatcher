/** Diagnostic prod — indique quelles variables sont présentes (pas leurs valeurs). */
export async function GET() {
  return Response.json({
    auth: {
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET?.trim()),
      AUTH_GITHUB_ID: Boolean(process.env.AUTH_GITHUB_ID?.trim()),
      AUTH_GITHUB_SECRET: Boolean(process.env.AUTH_GITHUB_SECRET?.trim()),
      NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET?.trim()),
    },
    supabase: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      ),
      wrongName_URL_SUPABASE: Boolean(process.env["URL SUPABASE"]?.trim()),
      wrongName_CLE_SERVICE: Boolean(
        process.env["CLÉ DE RÔLE DU SERVICE SUPABASE"]?.trim(),
      ),
    },
    ai: {
      AI_GATEWAY_API_KEY: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()),
      wrongName_CLE_API: Boolean(process.env["CLÉ_API_PASSEWAY_AI"]?.trim()),
    },
  });
}
