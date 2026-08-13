import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountDangerZone } from "@/components/account-danger-zone";
import { DashboardNav } from "@/components/dashboard-nav";
import { IntegrationSettings } from "@/components/integration-settings";
import { TeamSettings } from "@/components/team-settings";
import { getUserRepos } from "@/lib/github";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Settings",
  description:
    "Team seats, integrations, favorite repos, and account settings for Easy Patch.",
  path: "/dashboard/settings",
  noIndex: true,
});

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }

  let repos: Array<{ full_name: string }> = [];
  if (session.accessToken) {
    try {
      repos = await getUserRepos(session.accessToken);
    } catch {
      repos = [];
    }
  }

  return (
    <>
      <DashboardNav />
      <div className="mx-auto max-w-3xl space-y-8">
        <TeamSettings />
        <IntegrationSettings repos={repos} />
        <AccountDangerZone />
      </div>
    </>
  );
}
