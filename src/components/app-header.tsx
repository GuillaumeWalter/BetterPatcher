import Link from "next/link";
import { Sparkles } from "lucide-react";

import { auth, signOut } from "@/auth";
import { APP } from "@/lib/routes";
import { Button } from "@/components/ui/button";

export async function AppHeader() {
  const session = await auth();
  const label = session?.user?.name ?? session?.user?.email ?? "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={APP.home} className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <Sparkles className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              Easy Patch
            </p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              App
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <p className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:block md:max-w-[14rem]">
            {label}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
