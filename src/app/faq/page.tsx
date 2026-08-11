import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { BILLING } from "@/lib/billing/constants";
import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about Easy Patch trial, quotas, GitLab import, AI usage, and billing.",
  path: "/faq",
});

const faqs = [
  {
    q: "Why do I need a card for the free trial?",
    a: `We verify your card through Stripe (€0 today) to prevent abuse. You get ${BILLING.TRIAL_GENERATIONS} free generations before choosing Solo or Pro.`,
  },
  {
    q: "Can I use Perforce, Plastic, or SVN?",
    a: "Yes. Paste any commit log manually. GitHub and GitLab import are optional shortcuts.",
  },
  {
    q: "What happens when I hit my monthly quota?",
    a: "Generation pauses until your billing cycle resets, or you can upgrade from Solo to Pro for a higher limit.",
  },
  {
    q: "How do I cancel?",
    a: "Open Dashboard → Billing → Manage subscription. Stripe handles cancellation immediately; you keep access until the period ends.",
  },
  {
    q: "Is my code sent to an AI?",
    a: "Only the commit messages you submit are sent to our AI provider (Google Gemini). We do not store your repository code.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }}
      />
      <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
      <p className="mt-2 text-muted-foreground">
        Quick answers. Still stuck?{" "}
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>
        .
      </p>
      <dl className="mt-10 space-y-8">
        {faqs.map((item) => (
          <div key={item.q}>
            <dt className="text-lg font-medium">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
