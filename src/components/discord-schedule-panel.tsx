"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ScheduledPost = {
  id: string;
  scheduledAt: string;
  timezone: string;
  status: string;
};

type DiscordSchedulePanelProps = {
  patchNoteId?: string | null;
  content: string;
  disabled?: boolean;
  onScheduled?: () => void;
};

function formatScheduledAt(iso: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone || "UTC",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function DiscordSchedulePanel({
  patchNoteId,
  content,
  disabled = false,
  onScheduled,
}: DiscordSchedulePanelProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [minScheduleLocal] = useState(() =>
    new Date(Date.now() + 120_000).toISOString().slice(0, 16),
  );

  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const loadPosts = useCallback(async () => {
    if (!patchNoteId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ patchNoteId });
      const response = await fetch(
        `/api/share/discord/schedule?${params.toString()}`,
        { credentials: "same-origin" },
      );
      if (response.ok) {
        const data = (await response.json()) as { posts?: ScheduledPost[] };
        setPosts(data.posts ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [patchNoteId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadPosts();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadPosts]);

  async function handleSchedule() {
    if (!content.trim() || !scheduledAt) return;
    setIsScheduling(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/share/discord/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          content,
          scheduledAt: new Date(scheduledAt).toISOString(),
          timezone,
          patchNoteId: patchNoteId ?? undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        post?: ScheduledPost;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not schedule.");
      }

      setSuccess("Scheduled for Discord.");
      setScheduledAt("");
      onScheduled?.();
      await loadPosts();
      window.setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Schedule failed.");
    } finally {
      setIsScheduling(false);
    }
  }

  async function handleCancel(id: string) {
    setError(null);
    const params = new URLSearchParams({ id });
    const response = await fetch(
      `/api/share/discord/schedule?${params.toString()}`,
      { method: "DELETE", credentials: "same-origin" },
    );
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not cancel.");
      return;
    }
    await loadPosts();
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-background/40 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarClock className="size-4 text-primary" />
        Schedule Discord post
      </div>
      <p className="text-xs text-muted-foreground">
        Posts automatically via your linked bot or webhook. Trial: 1 pending ·
        Solo/Pro: up to 20.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="discord-schedule-at">Date & time</Label>
          <Input
            id="discord-schedule-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            disabled={disabled || isScheduling}
            min={minScheduleLocal}
          />
          <p className="text-xs text-muted-foreground">Timezone: {timezone}</p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={disabled || isScheduling || !scheduledAt || !content.trim()}
          onClick={() => void handleSchedule()}
        >
          {isScheduling ? <Loader2 className="animate-spin" /> : null}
          Schedule
        </Button>
      </div>

      {success ? (
        <p className="text-sm text-emerald-400">{success}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      ) : null}

      {patchNoteId && posts.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {isLoading ? (
            <li className="text-muted-foreground">Loading scheduled…</li>
          ) : null}
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <span className="text-muted-foreground">
                {formatScheduledAt(post.scheduledAt, post.timezone)}
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Cancel scheduled post"
                onClick={() => void handleCancel(post.id)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
