"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EnvCheck = {
  ai?: Record<string, boolean | string>;
  auth?: Record<string, boolean>;
  stripe?: Record<string, boolean>;
  supabase?: Record<string, boolean>;
  email?: Record<string, boolean>;
  ops?: Record<string, boolean>;
};

type CheckItem = {
  key: string;
  label: string;
  group: keyof EnvCheck;
  required?: boolean;
  docHref?: string;
};

const CHECKS: CheckItem[] = [
  { key: "GOOGLE_GENERATIVE_AI_API_KEY", label: "Google AI key", group: "ai", required: true },
  { key: "AUTH_SECRET", label: "Auth secret", group: "auth", required: true },
  { key: "AUTH_GITHUB_ID", label: "GitHub OAuth ID", group: "auth", required: true },
  { key: "AUTH_GITHUB_SECRET", label: "GitHub OAuth secret", group: "auth", required: true },
  { key: "SUPABASE_URL", label: "Supabase URL", group: "supabase", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service role", group: "supabase", required: true },
  { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", group: "stripe", required: true },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe webhook secret", group: "stripe", required: true },
  { key: "STRIPE_SOLO_PRICE_ID", label: "Stripe Solo price", group: "stripe", required: true },
  { key: "STRIPE_PRO_PRICE_ID", label: "Stripe Pro price", group: "stripe", required: true },
  { key: "RESEND_API_KEY", label: "Resend API key", group: "email", required: false },
  { key: "CRON_SECRET", label: "Cron secret", group: "ops", required: false },
  { key: "SENTRY_DSN", label: "Sentry DSN", group: "ops", required: false },
  { key: "DISCORD_BOT_TOKEN", label: "Discord bot token", group: "ops", required: false },
  { key: "AUTH_LINEAR_ID", label: "Linear OAuth ID", group: "ops", required: false },
];

export function SetupChecklist() {
  const [data, setData] = useState<EnvCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          const response = await fetch("/api/env-check", {
            credentials: "same-origin",
          });
          if (response.ok) {
            setData((await response.json()) as EnvCheck);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const required = CHECKS.filter((c) => c.required);
  const optional = CHECKS.filter((c) => !c.required);

  function isOk(item: CheckItem): boolean {
    const group = data?.[item.group];
    if (!group) return false;
    const value = group[item.key];
    return value === true;
  }

  const requiredDone = required.filter(isOk).length;
  const allRequiredOk = requiredDone === required.length;

  if (isLoading) {
    return (
      <Card className="surface-card gradient-border sm:col-span-2">
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking configuration…
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  if (allRequiredOk && optional.every(isOk)) {
    return null;
  }

  return (
    <Card className="surface-card gradient-border border-amber-500/20 sm:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {allRequiredOk ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <AlertCircle className="size-5 text-amber-500" />
          )}
          Setup checklist
        </CardTitle>
        <CardDescription>
          {allRequiredOk
            ? "Core services are configured. Optional integrations below."
            : `${requiredDone}/${required.length} required items configured on the server.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allRequiredOk ? (
          <ul className="space-y-2 text-sm">
            {required.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                {isOk(item) ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-amber-500" />
                )}
                <span className={isOk(item) ? "text-muted-foreground" : ""}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {optional.some((item) => !isOk(item)) ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Optional
            </p>
            <ul className="space-y-2 text-sm">
              {optional.map((item) => (
                <li key={item.key} className="flex items-center gap-2">
                  {isOk(item) ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-border" />
                  )}
                  <span className={isOk(item) ? "text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Button variant="outline" size="sm" asChild>
          <Link
            href="https://github.com/GuillaumeWalter/BetterPatcher/blob/master/docs/A-FAIRE-MAINTENANT.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Full setup guide
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
