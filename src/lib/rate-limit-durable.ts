import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  checkRateLimit as checkRateLimitMemory,
  peekRateLimit as peekRateLimitMemory,
  type RateLimitResult,
} from "@/lib/rate-limit";

function mapRpcResult(data: {
  allowed?: boolean;
  remaining?: number;
  limit?: number;
  retry_after_seconds?: number;
}): RateLimitResult {
  return {
    allowed: Boolean(data.allowed),
    remaining: data.remaining ?? 0,
    limit: data.limit ?? 0,
    retryAfterSeconds: data.retry_after_seconds,
  };
}

export async function peekRateLimitDurable(
  key: string,
  limit: number,
): Promise<Pick<RateLimitResult, "remaining" | "limit">> {
  const supabase = createSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.rpc("peek_rate_limit", {
      p_key: key,
      p_limit: limit,
    });

    if (!error && data && typeof data === "object") {
      const row = data as { remaining?: number; limit?: number };
      return {
        remaining: row.remaining ?? limit,
        limit: row.limit ?? limit,
      };
    }

    if (error) {
      console.warn("[peekRateLimitDurable] falling back to memory", error.message);
    }
  }

  return peekRateLimitMemory(key, limit);
}

export async function checkRateLimitDurable(
  key: string,
  limit: number,
  windowMs: number,
  increment = 1,
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const supabase = createSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
      p_increment: increment,
    });

    if (!error && data && typeof data === "object") {
      return mapRpcResult(
        data as {
          allowed?: boolean;
          remaining?: number;
          limit?: number;
          retry_after_seconds?: number;
        },
      );
    }

    if (error) {
      console.warn("[checkRateLimitDurable] falling back to memory", error.message);
    }
  }

  let last: RateLimitResult = {
    allowed: true,
    remaining: limit,
    limit,
  };

  for (let i = 0; i < increment; i += 1) {
    last = checkRateLimitMemory(key, limit, windowMs);
    if (!last.allowed) break;
  }

  return last;
}
