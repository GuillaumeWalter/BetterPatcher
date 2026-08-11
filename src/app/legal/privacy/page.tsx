import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>
      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Data we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>GitHub profile (name, email, id)</li>
            <li>Commit messages you submit</li>
            <li>Generated patch notes and Share Studio drafts</li>
            <li>Billing data via Stripe (we never store card numbers)</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Processors</h2>
          <p>
            Vercel (hosting), Supabase (database), Stripe (payments), Google
            (AI), GitHub/GitLab (auth and import).
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            Request access or deletion at{" "}
            <a
              href="mailto:support@easypatch.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@easypatch.app
            </a>
            .
          </p>
        </section>
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="font-medium text-foreground">Customize before launch</p>
          <p className="mt-1">
            Add data controller identity, retention periods, and cookie policy if
            you enable analytics.
          </p>
        </section>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
