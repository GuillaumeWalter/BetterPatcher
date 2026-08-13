"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Ticket } from "lucide-react";

import type { TicketResolution } from "@/lib/generation/resolve-tickets";
import { Button } from "@/components/ui/button";

type TicketEnrichmentPanelProps = {
  commits: string;
  isAuthenticated: boolean;
};

export function TicketEnrichmentPanel({
  commits,
  isAuthenticated,
}: TicketEnrichmentPanelProps) {
  const [data, setData] = useState<TicketResolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linearStatus, setLinearStatus] = useState<{
    connected: boolean;
    configured: boolean;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      if (!isAuthenticated) return;
      const response = await fetch("/api/linear/status", {
        credentials: "same-origin",
      });
      if (response.ok) {
        setLinearStatus(
          (await response.json()) as { connected: boolean; configured: boolean },
        );
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || commits.trim().length < 8) {
      const frame = requestAnimationFrame(() => setData(null));
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/tickets/preview", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commits }),
          });
          if (response.ok) {
            setData((await response.json()) as TicketResolution);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [commits, isAuthenticated]);

  if (!isAuthenticated || !data?.keys.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Ticket className="size-4 text-primary" />
        Ticket keys detected
        {isLoading ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
      </div>

      <ul className="space-y-1.5 text-sm">
        {data.tickets.map((ticket) => (
          <li key={ticket.key} className="text-muted-foreground">
            <span className="font-mono text-foreground">{ticket.key}</span>
            {ticket.title ? (
              <>
                {" "}
                · {ticket.title}
                {ticket.state ? ` (${ticket.state})` : ""}
              </>
            ) : (
              <span className="text-xs"> · title not loaded</span>
            )}
          </li>
        ))}
      </ul>

      {!data.canEnrich ? (
        <p className="text-xs text-muted-foreground">
          Linear enrichment is included on Solo and Pro.{" "}
          <Link href="/dashboard/billing" className="text-primary underline-offset-4 hover:underline">
            Upgrade
          </Link>
        </p>
      ) : null}

      {data.canEnrich && linearStatus?.configured && !linearStatus.connected ? (
        <Button size="sm" variant="outline" asChild>
          <a href="/api/linear/connect">Connect Linear</a>
        </Button>
      ) : null}

      {data.canEnrich && data.enriched ? (
        <p className="text-xs text-emerald-400">
          Titles will be woven into your patch note on generate.
        </p>
      ) : null}
    </div>
  );
}
