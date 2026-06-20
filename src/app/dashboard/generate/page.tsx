import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BillingQuotaBanner } from "@/components/billing-quota-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { PatchNoteGenerator } from "@/components/patch-note-generator";
import { getUserQuota } from "@/lib/supabase/users";

export default async function GeneratePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/generate");
  }

  const quota = await getUserQuota(session.user.id!);
  if (quota?.requiresSetup) {
    redirect("/onboarding");
  }

  return (
    <>
      <DashboardNav />
      <BillingQuotaBanner />
      <PatchNoteGenerator isAuthenticated />
    </>
  );
}
