import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Easy Patch</p>
            <p className="text-xs text-muted-foreground">
              Patch notes in one click
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
