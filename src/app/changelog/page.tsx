import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Changelog" };

const releases = [
  {
    version: "0.2.0",
    date: "August 2026",
    items: [
      "Free demo generator on landing (no account)",
      "Share Studio — per-platform social drafts",
      "GitLab import + commit range picker",
      "Solo & Pro plans with geo pricing",
      "Transactional emails (welcome, trial, billing)",
      "FAQ, Contact, legal pages",
    ],
  },
  {
    version: "0.1.0",
    date: "July 2026",
    items: [
      "GitHub OAuth + commit import",
      "AI patch notes (technical, marketing, gaming)",
      "Stripe trial + subscriptions",
      "Patch note history",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-muted-foreground">What shipped in Easy Patch.</p>
      <div className="mt-10 space-y-10">
        {releases.map((release) => (
          <section key={release.version}>
            <h2 className="text-xl font-semibold">
              v{release.version}{" "}
              <span className="text-base font-normal text-muted-foreground">
                — {release.date}
              </span>
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {release.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
