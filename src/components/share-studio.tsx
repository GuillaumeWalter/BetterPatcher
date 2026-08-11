"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Save } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import type { Tone } from "@/lib/constants";
import {
  PLATFORM_OPTIONS,
  defaultPlatformsForTone,
  platformLabel,
  seedDraftsFromSocialPost,
  type PlatformDraft,
  type SharePlatform,
} from "@/lib/share/platforms";
import { cn } from "@/lib/utils";

type ShareStudioProps = {
  tone: Tone;
  patchNoteId?: string | null;
  markdown: string;
  socialPost: string;
  initialDrafts?: PlatformDraft[];
  onMarkdownChange?: (value: string) => void;
  onSocialPostChange?: (value: string) => void;
  onDraftsChange?: (drafts: PlatformDraft[]) => void;
  onSaveMarkdown?: () => Promise<void> | void;
  markdownDirty?: boolean;
  isSavingMarkdown?: boolean;
};

export function ShareStudio({
  tone,
  patchNoteId,
  markdown,
  socialPost,
  initialDrafts,
  onMarkdownChange,
  onSocialPostChange,
  onDraftsChange,
  onSaveMarkdown,
  markdownDirty = false,
  isSavingMarkdown = false,
}: ShareStudioProps) {
  const defaultPlatforms = useMemo(
    () => defaultPlatformsForTone(tone),
    [tone],
  );

  const [drafts, setDrafts] = useState<PlatformDraft[]>(() =>
    initialDrafts && initialDrafts.length > 0
      ? initialDrafts
      : seedDraftsFromSocialPost(socialPost, tone),
  );
  const [activePlatform, setActivePlatform] = useState<SharePlatform>(
    () => drafts[0]?.platform ?? defaultPlatforms[0] ?? "discord",
  );
  const [selected, setSelected] = useState<SharePlatform[]>(() =>
    drafts.length > 0
      ? drafts.map((draft) => draft.platform)
      : defaultPlatforms,
  );
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (initialDrafts && initialDrafts.length > 0) {
        setDrafts(initialDrafts);
        setSelected(initialDrafts.map((draft) => draft.platform));
        setActivePlatform(initialDrafts[0].platform);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [initialDrafts]);

  const activeDraft = drafts.find((draft) => draft.platform === activePlatform);
  const activeMeta = PLATFORM_OPTIONS.find(
    (option) => option.value === activePlatform,
  );

  function updateDrafts(next: PlatformDraft[]) {
    setDrafts(next);
    onDraftsChange?.(next);
  }

  function togglePlatform(platform: SharePlatform) {
    setSelected((current) => {
      if (current.includes(platform)) {
        if (current.length === 1) return current;
        const next = current.filter((value) => value !== platform);
        if (activePlatform === platform) {
          setActivePlatform(next[0]);
        }
        return next;
      }
      return [...current, platform];
    });

    if (!drafts.some((draft) => draft.platform === platform)) {
      const seeded = seedDraftsFromSocialPost(socialPost, tone).find(
        (draft) => draft.platform === platform,
      );
      updateDrafts([
        ...drafts,
        seeded ?? { platform, title: "", body: socialPost },
      ]);
    }
    setActivePlatform(platform);
  }

  function setActiveBody(body: string) {
    updateDrafts(
      drafts.map((draft) =>
        draft.platform === activePlatform ? { ...draft, body } : draft,
      ),
    );
    if (activePlatform === defaultPlatforms[0]) {
      onSocialPostChange?.(body);
    }
    setDraftSaved(false);
  }

  function setActiveTitle(title: string) {
    updateDrafts(
      drafts.map((draft) =>
        draft.platform === activePlatform ? { ...draft, title } : draft,
      ),
    );
    setDraftSaved(false);
  }

  async function copyActive() {
    if (!activeDraft?.body) return;
    const text =
      activeDraft.title.trim().length > 0
        ? `${activeDraft.title.trim()}\n\n${activeDraft.body}`
        : activeDraft.body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function saveActiveDraft() {
    if (!patchNoteId || !activeDraft) return;
    setIsSavingDraft(true);
    setError(null);
    setDraftSaved(false);
    try {
      const response = await fetch(`/api/patch-notes/${patchNoteId}/drafts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: activeDraft.platform,
          title: activeDraft.title,
          body: activeDraft.body,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save draft.");
      }
      setDraftSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function regenerateActive() {
    if (!patchNoteId) {
      setError("Save the patch note first to regenerate a platform draft.");
      return;
    }
    setIsRegenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/patch-notes/${patchNoteId}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: activePlatform,
          instruction: instruction || undefined,
        }),
      });
      const data = (await response.json()) as {
        draft?: PlatformDraft;
        error?: string;
      };
      if (!response.ok || !data.draft) {
        throw new Error(data.error ?? "Could not regenerate.");
      }
      const exists = drafts.some(
        (draft) => draft.platform === data.draft!.platform,
      );
      updateDrafts(
        exists
          ? drafts.map((draft) =>
              draft.platform === data.draft!.platform ? data.draft! : draft,
            )
          : [...drafts, data.draft],
      );
      if (data.draft.platform === defaultPlatforms[0]) {
        onSocialPostChange?.(data.draft.body);
      }
      setDraftSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regenerate failed.");
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Patch note</CardTitle>
          <CardDescription>
            Edit the Markdown before adapting posts for each platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={markdown}
            onChange={(event) => onMarkdownChange?.(event.target.value)}
            readOnly={!onMarkdownChange}
            className="min-h-52 resize-y font-mono text-sm"
            placeholder="Patch note Markdown"
          />
          <div className="flex flex-wrap items-center gap-2">
            {onSaveMarkdown ? (
              <Button
                size="sm"
                onClick={() => void onSaveMarkdown()}
                disabled={isSavingMarkdown || !markdownDirty}
              >
                {isSavingMarkdown ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save />
                    Save Markdown
                  </>
                )}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              disabled={!markdown}
              onClick={() => void navigator.clipboard.writeText(markdown)}
            >
              <Copy />
              Copy Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Share Studio</CardTitle>
          <CardDescription>
            Platform drafts shaped for how each channel is used · copy when ready
            (publish and schedule come next)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((option) => {
                const isOn = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => togglePlatform(option.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      isOn
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-white/10 bg-background/40 text-muted-foreground hover:border-primary/30",
                      activePlatform === option.value &&
                        "ring-2 ring-primary/40",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-muted/30 p-1">
            {selected.map((platform) => (
              <Button
                key={platform}
                type="button"
                size="sm"
                variant={activePlatform === platform ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActivePlatform(platform)}
              >
                {platformLabel(platform)}
              </Button>
            ))}
          </div>

          {activeMeta ? (
            <p className="text-xs text-muted-foreground">
              {activeMeta.description} · {activeMeta.mediaHint}
            </p>
          ) : null}

          {activeMeta?.needsTitle ? (
            <div className="space-y-2">
              <Label htmlFor="draft-title">Title</Label>
              <Input
                id="draft-title"
                value={activeDraft?.title ?? ""}
                onChange={(event) => setActiveTitle(event.target.value)}
                placeholder="Steam event title"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="draft-body">Draft</Label>
            <Textarea
              id="draft-body"
              value={activeDraft?.body ?? ""}
              onChange={(event) => setActiveBody(event.target.value)}
              className="min-h-48 resize-y text-sm"
              placeholder="Platform draft appears here"
            />
            <p className="text-xs text-muted-foreground">
              {(activeDraft?.body ?? "").length.toLocaleString("en-US")} characters
            </p>
          </div>

          {onSocialPostChange && activePlatform === defaultPlatforms[0] ? (
            <p className="text-xs text-muted-foreground">
              Primary social preview stays in sync when you edit this draft.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="regen-instruction">Regenerate hint (optional)</Label>
            <Input
              id="regen-instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="e.g. More hype · shorter · add store link"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!activeDraft?.body}
              onClick={() => void copyActive()}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy draft"}
            </Button>
            {patchNoteId ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSavingDraft || !activeDraft}
                  onClick={() => void saveActiveDraft()}
                >
                  {isSavingDraft ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  Save draft
                </Button>
                <Button
                  size="sm"
                  disabled={isRegenerating || !markdown}
                  onClick={() => void regenerateActive()}
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <RefreshCw />
                      Regenerate for {platformLabel(activePlatform)}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Open from history (or generate while signed in) to save and
                regenerate drafts.
              </p>
            )}
            {draftSaved ? (
              <span className="text-sm text-muted-foreground">Draft saved</span>
            ) : null}
          </div>

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
