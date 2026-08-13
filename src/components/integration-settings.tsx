"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { DiscordBotSettings } from "@/components/discord-bot-settings";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IntegrationSettingsProps = {
  repos: Array<{ full_name: string }>;
};

type IntegrationsPayload = {
  releaseAutoRepo: string | null;
  discordWebhookUrl: string | null;
  releaseWebhookUrl: string | null;
};

export function IntegrationSettings({ repos }: IntegrationSettingsProps) {
  const [data, setData] = useState<IntegrationsPayload | null>(null);
  const [releaseRepo, setReleaseRepo] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/integrations", {
        credentials: "same-origin",
      });
      if (!response.ok) return;
      const payload = (await response.json()) as IntegrationsPayload;
      setData(payload);
      setReleaseRepo(payload.releaseAutoRepo ?? "");
      setDiscordWebhook(payload.discordWebhookUrl ?? "");
    })();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          releaseAutoRepo: releaseRepo || null,
          discordWebhookUrl: discordWebhook || null,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save.");
      }
      setMessage("Integrations saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">GitHub Release automation</CardTitle>
          <CardDescription>
            Auto-generate a patch note when you publish a GitHub release for a
            watched repo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="release-repo">Watched repository</Label>
            <Select value={releaseRepo || "none"} onValueChange={(value) => setReleaseRepo(value === "none" ? "" : value)}>
              <SelectTrigger id="release-repo">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {repos.map((repo) => (
                  <SelectItem key={repo.full_name} value={repo.full_name}>
                    {repo.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data?.releaseWebhookUrl ? (
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL (GitHub → Settings → Webhooks)</Label>
              <Input
                id="webhook-url"
                readOnly
                value={data.releaseWebhookUrl}
                onFocus={(event) => event.currentTarget.select()}
              />
              <p className="text-xs text-muted-foreground">
                Events: <strong>Releases</strong> only · Content type:{" "}
                <strong>application/json</strong>
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Discord bot (recommended)</CardTitle>
          <CardDescription>
            Invite the Easy Patch bot and link a channel with a slash command.
            Falls back to webhook below if the bot is not configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscordBotSettings />
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Discord webhook (fallback)</CardTitle>
          <CardDescription>
            Post Share Studio drafts to a Discord channel from the generator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discord-webhook">Incoming webhook URL</Label>
            <Input
              id="discord-webhook"
              type="url"
              value={discordWebhook}
              onChange={(event) => setDiscordWebhook(event.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save integrations
          </Button>
          {message ? (
            <p className="text-sm text-emerald-400">{message}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
