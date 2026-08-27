import Link from "next/link";

import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms of Service for Easy Patch.",
  path: "/legal/terms",
});

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
            Stripe. Prices shown at checkout apply. Subscriptions renew until
            canceled in the Stripe customer portal.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Acceptable use</h2>
          <p>
            Do not abuse the service, attempt to bypass quotas, scrape the API,
            or submit unlawful content. We may suspend accounts that violate
            these rules.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. AI output</h2>
          <p>
            Generated content is provided as-is. You are responsible for
            reviewing accuracy before publication.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Termination</h2>
          <p>
            You may stop using the service at any time. We may terminate or
            suspend access for breach of these terms or extended inactivity.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Easy Patch is provided
            without warranties. Our liability is limited to the fees you paid in
            the twelve months before the claim.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Governing law</h2>
          <p>
            These terms are governed by the laws of France, without regard to
            conflict-of-law rules. Courts in your country of residence may
            apply where mandatory consumer protections require it.
          </p>
        </section>
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="font-medium text-foreground">Customize before launch</p>
          <p className="mt-1">
            Add your legal entity name, registered address, and have a lawyer
            review liability and governing law clauses.
          </p>
        </section>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
