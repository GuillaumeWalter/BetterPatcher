import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Easy Patch</p>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/#pricing" className="hover:text-foreground hover:underline">
              Pricing
            </Link>
            <Link href="/faq" className="hover:text-foreground hover:underline">
              FAQ
            </Link>
            <Link href="/changelog" className="hover:text-foreground hover:underline">
              Changelog
            </Link>
            <Link href="/contact" className="hover:text-foreground hover:underline">
              Contact
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground hover:underline">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground hover:underline">
              Cookies
            </Link>
          </nav>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/80 sm:text-left">
          Payments secured by Stripe. AI output should be reviewed before publishing.
        </p>
      </div>
    </footer>
  );
}
