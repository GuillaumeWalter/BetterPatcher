import { createClient } from "@supabase/supabase-js";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function createSupabaseAdmin() {
  const url = readEnv("SUPABASE_URL", "URL SUPABASE");
  const serviceRoleKey = readEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "CLÉ DE RÔLE DU SERVICE SUPABASE",
  );

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
