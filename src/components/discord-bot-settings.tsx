"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DiscordLinkState = {
  inviteUrl: string | null;
  botConfigured: boolean;
  linked: boolean;
  guildId: string | null;
  channelId: string | null;
};

type LinkCodeResponse = {
  code: string;
  expiresAt: string;
  inviteUrl: string | null;
  instructions: string;
};

export function DiscordBotSettings() {
  const [status, setStatus] = useState<DiscordLinkState | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadStatus() {
    const response = await fetch("/api/discord/link", {
      credentials: "same-origin",
    });
    if (response.ok) {
      setStatus((await response.json()) as DiscordLinkState);
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          await loadStatus();
        } finally {
          setIsLoading(false);
        }
      })();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function generateCode() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/discord/link", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json()) as LinkCodeResponse & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not generate code.");
      }
      setLinkCode(data);
      await loadStatus();
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyCode() {
    if (!linkCode?.code) return;
    await navigator.clipboard.writeText(linkCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading Discord bot…
      </p>
    );
  }

  if (!status?.botConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Discord bot is not configured on the server yet. Use the webhook below,
        or ask the operator to set{" "}
        <code className="text-xs">DISCORD_BOT_TOKEN</code> on Vercel. See{" "}
        <a
          href="https://github.com/GuillaumeWalter/BetterPatcher/blob/master/docs/discord-bot.md"
          className="text-primary underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          setup guide
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {status.linked ? (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="size-4" />
          Channel linked (guild {status.guildId}, channel {status.channelId})
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Not linked yet. Invite the bot, then run{" "}
          <code className="text-xs">/easypatch link &lt;code&gt;</code> in your
          announcements channel.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {status.inviteUrl ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={status.inviteUrl} target="_blank" rel="noopener noreferrer">
              Invite bot to server
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          onClick={generateCode}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          Generate link code
        </Button>
      </div>

      {linkCode ? (
        <div className="space-y-2 rounded-lg border border-border/60 p-3">
          <p className="text-sm">
            Run in Discord:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /easypatch link {linkCode.code}
            </code>
          </p>
          <div className="flex gap-2">
            <Input readOnly value={linkCode.code} className="font-mono" />
            <Button type="button" size="icon" variant="outline" onClick={copyCode}>
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Expires {new Date(linkCode.expiresAt).toLocaleTimeString()}.{" "}
            {copied ? "Copied!" : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}
