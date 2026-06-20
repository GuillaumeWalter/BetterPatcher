import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AuthNav } from "@/components/auth-nav";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Release Hub</p>
            <p className="text-xs text-muted-foreground">
              Patch notes en un clic
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden border border-primary/20 bg-primary/10 text-primary sm:inline-flex"
          >
            Beta gratuite
          </Badge>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
