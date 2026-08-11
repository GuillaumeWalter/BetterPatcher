import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        Questions, billing issues, or partnership inquiries — we read every
        message.
      </p>
      <div className="surface-card gradient-border mt-8 space-y-4 rounded-2xl p-6">
        <p className="text-sm">
          Email:{" "}
          <a
            href="mailto:support@easypatch.app"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            support@easypatch.app
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          For Stripe billing or invoices, use{" "}
          <strong>Manage subscription</strong> in your dashboard — it opens the
          Stripe customer portal.
        </p>
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
