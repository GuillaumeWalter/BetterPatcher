import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Phase 2
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dashboard —{" "}
          <span className="gradient-text">
            {session.user.name ?? session.user.email}
          </span>
        </h1>
      </section>
      {children}
    </div>
  );
}
