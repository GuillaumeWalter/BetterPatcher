"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  History,
  Home,
  Settings,
  Wand2,
} from "lucide-react";

import { APP } from "@/lib/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: APP.home, label: "Home", icon: Home, exact: true },
  { href: APP.generate, label: "Generate", icon: Wand2 },
  { href: APP.history, label: "History", icon: History },
  { href: APP.billing, label: "Billing", icon: CreditCard },
  { href: APP.settings, label: "Settings", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className="mb-8 flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/50 p-1"
    >
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4",
              isActive
                ? "bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 opacity-90" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
