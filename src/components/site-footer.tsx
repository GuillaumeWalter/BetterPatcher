import Link from "next/link";

export function SiteFooter() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <footer className="border-t border-border/60 bg-background/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Release Hub</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#tarifs"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Tarifs
            </Link>
            <Link
              href="/legal/cgu"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              CGU
            </Link>
            <Link
              href="/legal/confidentialite"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Confidentialité
            </Link>
            <a
              href="mailto:contact@releasehub.app"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Contact
            </a>
            {isDev ? (
              <Link
                href="/api/env-check"
                className="text-primary underline-offset-4 transition-colors hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Diagnostic env
              </Link>
            ) : null}
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/80 sm:text-left">
          Paiements sécurisés par Stripe. Les contenus générés par IA doivent être
          relus avant publication.
        </p>
      </div>
    </footer>
  );
}
