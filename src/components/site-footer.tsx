import Link from "next/link";

export function SiteFooter() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <footer className="border-t border-border/60 bg-background/50">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p>© {new Date().getFullYear()} Release Hub</p>
        <div className="flex items-center gap-4">
          {isDev ? (
            <Link
              href="/api/env-check"
              className="text-primary underline-offset-4 transition-colors hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Diagnostic env (dev)
            </Link>
          ) : null}
          <Link
            href="/#tarifs"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Tarifs
          </Link>
        </div>
      </div>
    </footer>
  );
}
