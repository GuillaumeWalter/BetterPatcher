import { DashboardContent } from "@/components/dashboard-content";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardPage() {
  return (
    <>
      <DashboardNav />
      <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Importez vos commits depuis GitHub, puis générez vos patch notes sur
        l&apos;outil gratuit.
      </p>
      <DashboardContent />
    </>
  );
}
