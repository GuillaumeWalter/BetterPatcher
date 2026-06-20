"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Repos" },
  { href: "/dashboard/history", label: "Historique" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 rounded-xl border border-border/70 bg-muted/60 p-1">
      {links.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
