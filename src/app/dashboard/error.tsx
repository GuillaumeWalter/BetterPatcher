"use client";

import { useEffect } from "react";
import Link from "next/link";

import { captureException } from "@/lib/monitoring";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest, scope: "dashboard" });
  }, [error]);

  return (
    <div className="surface-card gradient-border mx-auto max-w-lg rounded-2xl p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We could not load this dashboard page. Try again or head back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard home</Link>
        </Button>
      </div>
    </div>
  );
}
