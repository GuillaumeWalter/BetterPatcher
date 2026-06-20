import { auth } from "@/auth";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <>
      <DashboardNav />
      <p className="mb-8 text-muted-foreground">
        Importez vos commits depuis GitHub, puis générez vos patch notes.
      </p>
      <DashboardContent isAuthenticated={Boolean(session?.user)} />
    </>
  );
}
