import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Release Hub</p>
            <p className="text-xs text-muted-foreground">
              Patch notes en un clic
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Beta gratuite
        </Badge>
      </div>
    </header>
  );
}
