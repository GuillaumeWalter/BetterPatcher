import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { PatchNoteGenerator } from "@/components/patch-note-generator";
import { getUserQuota } from "@/lib/supabase/users";

type GeneratePageProps = {
  searchParams: Promise<{ gitlab?: string; linear?: string }>;
};

function oauthBanner(
  provider: "GitLab" | "Linear",
  status: string | undefined,
) {
  if (status === "connected") {
    return {
      className: "border-emerald-500/20 bg-emerald-500/10",
      text: `${provider} connected. Ticket titles will enrich your next generation when keys appear in commits.`,
    };
  }
  if (status === "denied") {
    return {
      className: "border-amber-500/20 bg-amber-500/10",
      text: `${provider} authorization was denied.`,
    };
  }
  if (
    status === "error" ||
    status === "invalid_state" ||
    status === "save_failed"
  ) {
    return {
      className: "border-destructive/20 bg-destructive/10",
      text: `Could not connect ${provider}. Try again.`,
    };
  }
  return null;
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/generate");
  }

  const quota = await getUserQuota(session.user.id!);
  if (quota?.requiresSetup) {
    redirect("/onboarding");
  }

  const { gitlab, linear } = await searchParams;
  const banner = gitlabBanner(gitlab) ?? oauthBanner("Linear", linear);

  return (
    <>
      <DashboardNav />
      <BillingQuotaBanner />
      {banner ? (
        <p className={`mb-6 rounded-xl border p-4 text-sm ${banner.className}`}>
          {banner.text}
        </p>
      ) : null}
      <PatchNoteGenerator isAuthenticated />
    </>
  );
}

function gitlabBanner(status: string | undefined) {
  if (status === "connected") {
    return {
      className: "border-emerald-500/20 bg-emerald-500/10",
      text: "GitLab connected. Pick a project under the GitLab tab.",
    };
  }
  if (status === "denied") {
    return {
      className: "border-amber-500/20 bg-amber-500/10",
      text: "GitLab authorization was denied.",
    };
  }
  if (
    status === "error" ||
    status === "invalid_state" ||
    status === "save_failed"
  ) {
    return {
      className: "border-destructive/20 bg-destructive/10",
      text: "Could not connect GitLab. Try again from the GitLab tab.",
    };
  }
  return null;
}
