import Link from "next/link";

import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How Easy Patch uses cookies and similar technologies.",
  path: "/legal/cookies",
});

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>
      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">What we use</h2>
          <p>
            Easy Patch uses a small number of cookies and similar technologies to
            keep you signed in, secure the service, and (optionally) measure
            traffic.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Essential cookies</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Session (Auth.js)</strong> —
              keeps you logged in after GitHub sign-in. Required for the
              dashboard.
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> — fraud
              prevention during checkout and card verification.
            </li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Analytics (optional)</h2>
          <p>
            If <code className="rounded bg-muted px-1">NEXT_PUBLIC_PLAUSIBLE_DOMAIN</code>{" "}
            is configured, we load Plausible Analytics — a privacy-friendly tool
            that does not use third-party advertising cookies. No personal data is
            sold.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
          <p>
            You can block non-essential cookies in your browser. Blocking session
            cookies will prevent login. Plausible can be disabled by not setting
            the analytics environment variable.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">More information</h2>
          <p>
            See our{" "}
            <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>{" "}
            for how we process personal data.
          </p>
        </section>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
