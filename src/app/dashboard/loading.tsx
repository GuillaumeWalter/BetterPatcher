import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLoading() {
  return (
    <>
      <DashboardNav />
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="surface-card gradient-border h-20 animate-pulse rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card gradient-border h-96 animate-pulse rounded-2xl" />
          <div className="surface-card gradient-border h-96 animate-pulse rounded-2xl" />
        </div>
      </div>
    </>
  );
}
