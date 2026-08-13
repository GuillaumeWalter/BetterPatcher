import {
  BILLING,
  buildQuotaSnapshot,
  monthlyGenerationsForTier,
  type PaidPlanTier,
  type PlanTier,
  type QuotaSnapshot,
  type SubscriptionStatus,
  type UserBillingProfile,
} from "@/lib/billing/constants";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { resolveBillingUserId } from "@/lib/supabase/team";

type UserProfileRow = {
  user_id: string;
  email: string | null;
  stripe_customer_id: string | null;
  payment_method_verified: boolean;
  subscription_status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  plan_tier: PlanTier | null;
  trial_generations_used: number;
  trial_generations_limit: number;
  period_generations_used: number;
  period_generations_limit: number;
  billing_period_start: string | null;
  last_generation_at: string | null;
  github_access_token: string | null;
  release_auto_repo: string | null;
  discord_webhook_url: string | null;
  workspace_owner_id: string | null;
  favorite_repos: string[] | null;
  discord_guild_id: string | null;
  discord_channel_id: string | null;
};

function mapPlanTier(value: PlanTier | null | undefined): PlanTier {
  if (value === "solo" || value === "pro" || value === "none") return value;
  return "none";
}

function mapProfile(row: UserProfileRow): UserBillingProfile {
  return {
    userId: row.user_id,
    email: row.email,
    stripeCustomerId: row.stripe_customer_id,
    paymentMethodVerified: row.payment_method_verified,
    subscriptionStatus: row.subscription_status,
    stripeSubscriptionId: row.stripe_subscription_id,
    planTier: mapPlanTier(row.plan_tier),
    trialGenerationsUsed: row.trial_generations_used,
    trialGenerationsLimit: row.trial_generations_limit,
    periodGenerationsUsed: row.period_generations_used,
    periodGenerationsLimit: row.period_generations_limit,
    billingPeriodStart: row.billing_period_start,
    lastGenerationAt: row.last_generation_at,
    githubAccessToken: row.github_access_token,
    releaseAutoRepo: row.release_auto_repo,
    discordWebhookUrl: row.discord_webhook_url,
    workspaceOwnerId: row.workspace_owner_id,
    favoriteRepos: row.favorite_repos ?? [],
    discordGuildId: row.discord_guild_id,
    discordChannelId: row.discord_channel_id,
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

export async function getFavoriteRepos(userId: string): Promise<string[]> {
  const profile = await getUserProfile(userId);
  return profile?.favoriteRepos ?? [];
}

export async function setFavoriteRepos(
  userId: string,
  repos: string[],
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const unique = [...new Set(repos.map((r) => r.trim()).filter(Boolean))].slice(
    0,
    20,
  );

  const { error } = await supabase
    .from("user_profiles")
    .update({ favorite_repos: unique })
    .eq("user_id", userId);

  if (error) {
    console.error("[setFavoriteRepos]", error);
    return false;
  }

  return true;
}

export async function toggleFavoriteRepo(
  userId: string,
  repoFullName: string,
): Promise<{ favorites: string[]; isFavorite: boolean } | null> {
  const current = await getFavoriteRepos(userId);
  const normalized = repoFullName.trim();
  if (!normalized) return null;

  const isFavorite = current.includes(normalized);
  const next = isFavorite
    ? current.filter((r) => r !== normalized)
    : [normalized, ...current];

  const ok = await setFavoriteRepos(userId, next);
  if (!ok) return null;

  return {
    favorites: isFavorite ? current.filter((r) => r !== normalized) : next,
    isFavorite: !isFavorite,
  };
}

export async function getUserQuota(userId: string): Promise<QuotaSnapshot | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const billingUserId = await resolveBillingUserId(userId);
  const billingProfile =
    billingUserId === userId
      ? profile
      : await getUserProfile(billingUserId);

  if (!billingProfile) return null;

  const teamOwnerId =
    profile.workspaceOwnerId && profile.workspaceOwnerId !== userId
      ? profile.workspaceOwnerId
      : null;

  return buildQuotaSnapshot(billingProfile, { teamOwnerId });
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

export async function markPaymentMethodVerified(
  userId: string,
): Promise<{ ok: boolean; newlyVerified: boolean }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return { ok: false, newlyVerified: false };

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("payment_method_verified")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.payment_method_verified) {
    return { ok: true, newlyVerified: false };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ payment_method_verified: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[markPaymentMethodVerified]", error);
    return { ok: false, newlyVerified: false };
  }

  return { ok: true, newlyVerified: true };
}

export async function updateSubscriptionState(input: {
  userId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  planTier?: PaidPlanTier | "none";
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
    const tier: PaidPlanTier =
      input.planTier === "solo" || input.planTier === "pro"
        ? input.planTier
        : "pro";
    patch.plan_tier = tier;
    patch.period_generations_limit = monthlyGenerationsForTier(tier);
    if (input.resetPeriodUsage) {
      patch.period_generations_used = 0;
    }
    if (input.billingPeriodStart) {
      patch.billing_period_start = input.billingPeriodStart.toISOString();
    }
  }

  if (input.subscriptionStatus === "canceled" || input.subscriptionStatus === "none") {
    patch.period_generations_limit = 0;
    patch.plan_tier = "none";
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

/** Trial activated but no generation yet — for reminder cron. */
export async function listInactiveTrialCandidates(minAgeDays = 3): Promise<
  Array<{ userId: string; email: string }>
> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - minAgeDays);

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, email")
    .eq("payment_method_verified", true)
    .eq("trial_generations_used", 0)
    .neq("subscription_status", "active")
    .is("last_generation_at", null)
    .not("email", "is", null)
    .lt("updated_at", cutoff.toISOString());

  if (error) {
    console.error("[listInactiveTrialCandidates]", error);
    return [];
  }

  return (data ?? [])
    .filter(
      (row): row is { user_id: string; email: string } =>
        typeof row.user_id === "string" && typeof row.email === "string",
    )
    .map((row) => ({ userId: row.user_id, email: row.email }));
}

export async function getGitLabAccessToken(
  userId: string,
): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("gitlab_access_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getGitLabAccessToken]", error);
    return null;
  }

  const token = data?.gitlab_access_token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export async function setGitLabAccessToken(
  userId: string,
  token: string | null,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  await ensureUserProfile({ userId, email: null });

  const { error } = await supabase
    .from("user_profiles")
    .update({ gitlab_access_token: token })
    .eq("user_id", userId);

  if (error) {
    console.error("[setGitLabAccessToken]", error);
    return false;
  }

  return true;
}

export async function setGitHubAccessToken(
  userId: string,
  token: string | null,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  await ensureUserProfile({ userId, email: null });

  const { error } = await supabase
    .from("user_profiles")
    .update({ github_access_token: token })
    .eq("user_id", userId);

  if (error) {
    console.error("[setGitHubAccessToken]", error);
    return false;
  }

  return true;
}

export async function getGitHubAccessToken(
  userId: string,
): Promise<string | null> {
  const profile = await getUserProfile(userId);
  const token = profile?.githubAccessToken;
  return token && token.length > 0 ? token : null;
}

export async function updateUserIntegrations(
  userId: string,
  input: {
    releaseAutoRepo?: string | null;
    discordWebhookUrl?: string | null;
  },
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return false;

  const patch: Record<string, unknown> = {};
  if (input.releaseAutoRepo !== undefined) {
    patch.release_auto_repo = input.releaseAutoRepo;
  }
  if (input.discordWebhookUrl !== undefined) {
    patch.discord_webhook_url = input.discordWebhookUrl;
  }

  if (Object.keys(patch).length === 0) return true;

  const { error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("user_id", userId);

  if (error) {
    console.error("[updateUserIntegrations]", error);
    return false;
  }

  return true;
}

export async function findUserByReleaseRepo(
  repoFullName: string,
): Promise<UserBillingProfile | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("release_auto_repo", repoFullName)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[findUserByReleaseRepo]", error);
    return null;
  }

  return mapProfile(data as UserProfileRow);
}
