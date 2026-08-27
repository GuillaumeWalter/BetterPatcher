import Link from "next/link";

import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Easy Patch collects, uses, and protects your data.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>
      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Data controller</h2>
          <p>
            Easy Patch (operator name and address to be completed before public
            launch). Contact:{" "}
            <a
              href="mailto:support@easypatch.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@easypatch.app
            </a>
            .
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Data we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>GitHub profile (name, email, id)</li>
            <li>Commit messages you submit for generation</li>
            <li>Generated patch notes and Share Studio drafts</li>
            <li>Billing metadata via Stripe (we never store card numbers)</li>
            <li>Usage logs (IP, timestamps) for security and rate limiting</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Legal basis (GDPR)</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Contract — providing the service you signed up for</li>
            <li>Legitimate interest — fraud prevention and abuse limits</li>
            <li>Consent — optional analytics cookies where applicable</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Retention</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account and patch note history — until you delete your account</li>
            <li>Billing records — as required by tax law (typically 6–10 years)</li>
            <li>Server logs — up to 30 days</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Subprocessors</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-medium text-foreground">Provider</th>
                  <th className="py-2 pr-4 font-medium text-foreground">Purpose</th>
                  <th className="py-2 font-medium text-foreground">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4">Vercel</td>
                  <td className="py-2 pr-4">Hosting</td>
                  <td className="py-2">EU / US</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4">Supabase</td>
                  <td className="py-2 pr-4">Database</td>
                  <td className="py-2">EU / US</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4">Stripe</td>
                  <td className="py-2 pr-4">Payments</td>
                  <td className="py-2">EU / US</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4">Google (Gemini)</td>
                  <td className="py-2 pr-4">AI generation</td>
                  <td className="py-2">US</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4">Resend</td>
                  <td className="py-2 pr-4">Transactional email</td>
                  <td className="py-2">US</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Plausible</td>
                  <td className="py-2 pr-4">Analytics (optional)</td>
                  <td className="py-2">EU</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">International transfers</h2>
          <p>
            Some processors are outside the EEA. We rely on Standard Contractual
            Clauses or equivalent safeguards where required.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            Request access, correction, deletion, or portability at{" "}
            <a
              href="mailto:support@easypatch.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@easypatch.app
            </a>
            . You may lodge a complaint with your local data protection authority.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            See our{" "}
            <Link href="/legal/cookies" className="text-primary underline-offset-4 hover:underline">
              Cookie Policy
            </Link>{" "}
            for details on analytics and essential cookies.
          </p>
        </section>
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="font-medium text-foreground">Customize before launch</p>
          <p className="mt-1">
            Add data controller identity and confirm retention periods with
            professional advice.
          </p>
        </section>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
