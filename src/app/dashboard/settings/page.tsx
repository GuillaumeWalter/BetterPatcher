import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { IntegrationSettings } from "@/components/integration-settings";
import { getUserRepos } from "@/lib/github";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Integrations",
  description: "GitHub release automation and Discord publishing for Easy Patch.",
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
      <IntegrationSettings repos={repos} />
    </>
  );
}
