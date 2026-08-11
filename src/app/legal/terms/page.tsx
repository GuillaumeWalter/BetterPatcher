import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>
      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Service</h2>
          <p>
            Easy Patch generates patch notes and marketing copy from commit
            messages using AI. By using the service you accept these terms.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Accounts & billing</h2>
          <p>
            Access requires a GitHub account. Paid plans are billed monthly via
            Stripe. Prices shown at checkout apply.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. AI output</h2>
          <p>
            Generated content is provided as-is. You are responsible for
            reviewing accuracy before publication.
          </p>
        </section>
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="font-medium text-foreground">Customize before launch</p>
          <p className="mt-1">
            Add legal entity name, address, governing law, and liability limits
            with professional advice.
          </p>
        </section>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
