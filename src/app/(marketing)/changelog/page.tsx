import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { CHANGELOG_RELEASES } from "@/content/changelog";
import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Changelog",
  description: "What shipped in Easy Patch — releases and product updates.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Easy Patch Changelog",
          description: "Release notes for Easy Patch.",
        }}
      />
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-muted-foreground">What shipped in Easy Patch.</p>
      <div className="mt-10 space-y-10">
        {CHANGELOG_RELEASES.map((release) => (
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
