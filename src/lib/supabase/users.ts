import {
  BILLING,
  buildQuotaSnapshot,
  type QuotaSnapshot,
  type SubscriptionStatus,
  type UserBillingProfile,
} from "@/lib/billing/constants";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type UserProfileRow = {
  user_id: string;
  email: string | null;
  stripe_customer_id: string | null;
  payment_method_verified: boolean;
  subscription_status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  trial_generations_used: number;
  trial_generations_limit: number;
  period_generations_used: number;
  period_generations_limit: number;
  billing_period_start: string | null;
  last_generation_at: string | null;
};

function mapProfile(row: UserProfileRow): UserBillingProfile {
  return {
    userId: row.user_id,
    email: row.email,
    stripeCustomerId: row.stripe_customer_id,
    paymentMethodVerified: row.payment_method_verified,
    subscriptionStatus: row.subscription_status,
    stripeSubscriptionId: row.stripe_subscription_id,
    trialGenerationsUsed: row.trial_generations_used,
    trialGenerationsLimit: row.trial_generations_limit,
    periodGenerationsUsed: row.period_generations_used,
    periodGenerationsLimit: row.period_generations_limit,
    billingPeriodStart: row.billing_period_start,
    lastGenerationAt: row.last_generation_at,
  };
}

export async function ensureUserProfile(input: {
  userId: string;
  email: string | null;
}) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      user_id: input.userId,
      email: input.email,
      trial_generations_limit: BILLING.TRIAL_GENERATIONS,
    })
    .select("user_id")
    .single();

  if (error) {
    console.error("[ensureUserProfile]", error);
    return null;
  }

  return data;
}

export async function getUserProfile(
  userId: string,
): Promise<UserBillingProfile | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getUserProfile]", error);
    return null;
  }

  return mapProfile(data as UserProfileRow);
}

export async function getUserQuota(userId: string): Promise<QuotaSnapshot | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;
  return buildQuotaSnapshot(profile);
}

export async function setStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("user_id", userId);

  if (error) {
    console.error("[setStripeCustomerId]", error);
    return false;
  }

  return true;
}

export async function markPaymentMethodVerified(userId: string) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({ payment_method_verified: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[markPaymentMethodVerified]", error);
    return false;
  }

  return true;
}

export async function updateSubscriptionState(input: {
  userId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  billingPeriodStart?: Date | null;
  resetPeriodUsage?: boolean;
}) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  let userId = input.userId;

  if (!userId && input.stripeCustomerId) {
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("stripe_customer_id", input.stripeCustomerId)
      .maybeSingle();

    userId = data?.user_id;
  }

  if (!userId) return false;

  const patch: Record<string, unknown> = {
    stripe_subscription_id: input.stripeSubscriptionId,
    subscription_status: input.subscriptionStatus,
  };

  if (input.subscriptionStatus === "active") {
    patch.period_generations_limit = BILLING.PRO_MONTHLY_GENERATIONS;
    if (input.resetPeriodUsage) {
      patch.period_generations_used = 0;
    }
    if (input.billingPeriodStart) {
      patch.billing_period_start = input.billingPeriodStart.toISOString();
    }
  }

  if (input.subscriptionStatus === "canceled" || input.subscriptionStatus === "none") {
    patch.period_generations_limit = 0;
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("user_id", userId);

  if (error) {
    console.error("[updateSubscriptionState]", error);
    return false;
  }

  return true;
}

export async function resetBillingPeriodUsage(input: {
  stripeCustomerId: string;
  billingPeriodStart: Date;
}) {
  return updateSubscriptionState({
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: null,
    subscriptionStatus: "active",
    billingPeriodStart: input.billingPeriodStart,
    resetPeriodUsage: true,
  });
}

type ConsumeResult =
  | { ok: true; plan: string; generationsRemaining: number }
  | { ok: false; code: string; plan?: string };

export async function consumeGeneration(userId: string): Promise<ConsumeResult> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, code: "database_unavailable" };
  }

  const { data, error } = await supabase.rpc("consume_generation", {
    p_user_id: userId,
    p_min_interval_seconds: BILLING.MIN_SECONDS_BETWEEN_GENERATIONS,
  });

  if (error) {
    console.error("[consumeGeneration]", error);
    return { ok: false, code: "database_error" };
  }

  const result = data as {
    ok: boolean;
    code?: string;
    plan?: string;
    generations_remaining?: number;
  };

  if (!result.ok) {
    return {
      ok: false,
      code: result.code ?? "unknown",
      plan: result.plan,
    };
  }

  return {
    ok: true,
    plan: result.plan ?? "trial",
    generationsRemaining: result.generations_remaining ?? 0,
  };
}

export async function refundGeneration(userId: string, plan: string) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.rpc("refund_generation", {
    p_user_id: userId,
    p_plan: plan,
  });

  if (error) {
    console.error("[refundGeneration]", error);
  }
}

export async function getUserIdByStripeCustomerId(
  stripeCustomerId: string,
): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  return data?.user_id ?? null;
}
