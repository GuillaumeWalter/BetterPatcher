"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { GitHubCommitImport } from "@/components/github-commit-import";
import { GitLabCommitImport } from "@/components/gitlab-commit-import";
import { TicketEnrichmentPanel } from "@/components/ticket-enrichment-panel";
import { GenerationSkeleton } from "@/components/generation-skeleton";
import { ShareStudio } from "@/components/share-studio";
import { useBillingQuota } from "@/components/billing-quota-banner";
import {
  COMMITS_STORAGE_KEY,
  REPO_STORAGE_KEY,
} from "@/lib/github-session";
import { rememberGeneratedMessages } from "@/lib/import-memory";
import { consumeGenerationStream } from "@/lib/generation/stream-client";
import {
  listReferencePatches,
  saveReferencePatch,
  type SavedReferencePatch,
} from "@/lib/reference-patches";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_GENERATION_OPTIONS,
  GENERATION_OPTION_DEFS,
  TONE_OPTIONS,
  type GenerationOptions,
  type Tone,
} from "@/lib/constants";
import type { PlatformDraft } from "@/lib/share/platforms";

const PLACEHOLDER_COMMITS = `feat(auth): add OAuth GitHub login
fix(api): resolve race condition on webhook delivery
chore(deps): bump next.js to 16.2
docs: update deployment guide`;

type InputMode = "paste" | "github" | "gitlab";

type PatchNoteGeneratorProps = {
  isAuthenticated?: boolean;
};

export function PatchNoteGenerator({
  isAuthenticated = false,
}: PatchNoteGeneratorProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    isAuthenticated ? "github" : "paste",
  );
  const [commits, setCommits] = useState("");
  const [tone, setTone] = useState<Tone>("technical");
  const [options, setOptions] = useState<GenerationOptions>(
    DEFAULT_GENERATION_OPTIONS,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [socialPost, setSocialPost] = useState("");
  const [platformDrafts, setPlatformDrafts] = useState<PlatformDraft[]>([]);
  const [liveMessage, setLiveMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [referencePatch, setReferencePatch] = useState("");
  const [savedReferences, setSavedReferences] = useState<SavedReferencePatch[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [markdownSaved, setMarkdownSaved] = useState(true);
  const [baselineMarkdown, setBaselineMarkdown] = useState("");
  const { quota, refreshQuota } = useBillingQuota();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = sessionStorage.getItem(COMMITS_STORAGE_KEY);
      if (stored) {
        setCommits(stored);
        sessionStorage.removeItem(COMMITS_STORAGE_KEY);
      }
      const storedRepo = sessionStorage.getItem(REPO_STORAGE_KEY);
      if (storedRepo) {
        setRepoFullName(storedRepo);
        sessionStorage.removeItem(REPO_STORAGE_KEY);
      }
      setSavedReferences(listReferencePatches());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function handleGenerate() {
    if (!commits.trim()) return;

    setIsLoading(true);
    setMarkdown("");
    setSocialPost("");
    setPlatformDrafts([]);
    setError(null);
    setErrorCode(null);
    setSavedId(null);
    setLiveMessage("Generating patch note…");

    try {
      const response = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commits,
          tone,
          repoFullName,
          options,
          referencePatch: referencePatch.trim() || undefined,
        }),
      });

      const result = await consumeGenerationStream(response, (partial) => {
        if (partial.markdown !== undefined) setMarkdown(partial.markdown);
        if (partial.socialPost !== undefined) setSocialPost(partial.socialPost);
        if (partial.platformDrafts !== undefined) {
          setPlatformDrafts(partial.platformDrafts);
        }
      });

      const nextMarkdown = result.markdown ?? "";
      setMarkdown(nextMarkdown);
      setBaselineMarkdown(nextMarkdown);
      setMarkdownSaved(true);
      setSocialPost(result.socialPost ?? "");
      setPlatformDrafts(result.platformDrafts ?? []);
      setSavedId(result.savedId ?? null);
      rememberGeneratedMessages(repoFullName, commits);
      if (referencePatch.trim()) {
        setSavedReferences(saveReferencePatch(referencePatch));
      }
      await refreshQuota();
      setLiveMessage("Patch note generated.");
    } catch (err) {
      const code =
        err instanceof Error
          ? (err as Error & { code?: string }).code
          : undefined;
      setErrorCode(code ?? null);
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setLiveMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveMarkdown() {
    if (!savedId) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/patch-notes/${savedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, socialPost }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save.");
      }
      setBaselineMarkdown(markdown);
      setMarkdownSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSourceImport(text: string, repo: string) {
    setCommits(text);
    setRepoFullName(repo);
    setInputMode("paste");
  }

  const showBillingCta =
    errorCode === "subscription_required" ||
    errorCode === "quota_exceeded" ||
    errorCode === "setup_required" ||
    (error !== null &&
      (error.includes("Trial ended") ||
        error.includes("quota") ||
        error.includes("card")));

  const billingCtaLabel =
    errorCode === "setup_required" || error?.includes("card")
      ? "Activate trial"
      : "View billing";

  const hasResult = Boolean(markdown || socialPost || platformDrafts.length);

  return (
    <div className="space-y-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">Your commits</CardTitle>
            <CardDescription>
              Import from GitHub / GitLab, or paste a log (Perforce, Plastic, SVN…)
              {quota ? (
                <>
                  {" "}
                  · {quota.generationsRemaining}/{quota.generationsLimit}{" "}
                  remaining
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              className="flex gap-1 rounded-lg border border-white/10 bg-muted/30 p-1"
              role="tablist"
              aria-label="Commit source"
            >
              {(
                [
                  ["paste", "Paste"],
                  ["github", "GitHub"],
                  ["gitlab", "GitLab"],
                ] as const
              ).map(([mode, label]) => (
                <Button
                  key={mode}
                  type="button"
                  role="tab"
                  id={`tab-${mode}`}
                  aria-selected={inputMode === mode}
                  aria-controls={`panel-${mode}`}
                  variant={inputMode === mode ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setInputMode(mode)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {inputMode === "github" ? (
              <div id="panel-github" role="tabpanel" aria-labelledby="tab-github">
              <GitHubCommitImport
                isAuthenticated={isAuthenticated}
                loginCallbackUrl="/dashboard/generate"
                onImport={handleSourceImport}
              />
              </div>
            ) : null}

            {inputMode === "gitlab" ? (
              <div id="panel-gitlab" role="tabpanel" aria-labelledby="tab-gitlab">
              <GitLabCommitImport
                isAuthenticated={isAuthenticated}
                onImport={handleSourceImport}
              />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="commits">Commit messages</Label>
                {repoFullName ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {repoFullName}
                  </span>
                ) : null}
              </div>
              <Textarea
                id="commits"
                placeholder={PLACEHOLDER_COMMITS}
                value={commits}
                onChange={(event) => setCommits(event.target.value)}
                className="min-h-52 resize-y font-mono text-sm"
              />
            </div>

            <TicketEnrichmentPanel
              commits={commits}
              isAuthenticated={isAuthenticated}
            />

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={tone}
                onValueChange={(value) => setTone(value as Tone)}
              >
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue placeholder="Choose a tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        : {option.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Formatting options</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {GENERATION_OPTION_DEFS.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-background/40 p-3 transition-colors hover:border-primary/30"
                  >
                    <Checkbox
                      checked={options[option.key]}
                      onCheckedChange={(checked) =>
                        setOptions((current) => ({
                          ...current,
                          [option.key]: checked === true,
                        }))
                      }
                      className="mt-0.5"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="reference-patch">Style reference (optional)</Label>
                {referencePatch.trim() ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReferencePatch("")}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a real patch note written without Easy Patch. Generation
                will copy its structure and voice.
              </p>
              {savedReferences.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {savedReferences.map((entry) => (
                    <Button
                      key={entry.id}
                      type="button"
                      variant={
                        referencePatch.trim() === entry.body.trim()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="max-w-full truncate text-xs"
                      onClick={() => setReferencePatch(entry.body)}
                    >
                      {entry.label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <Textarea
                id="reference-patch"
                placeholder="Paste an older Steam / Discord / changelog patch note here…"
                value={referencePatch}
                onChange={(event) => setReferencePatch(event.target.value)}
                className="min-h-28 resize-y text-sm"
              />
              {referencePatch.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSavedReferences(saveReferencePatch(referencePatch))
                  }
                >
                  Save for quick reuse
                </Button>
              ) : null}
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={
                isLoading || !commits.trim() || quota?.canGenerate === false
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 />
                  Generate patch note
                </>
              )}
            </Button>

            {error ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
                {showBillingCta ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/billing">{billingCtaLabel}</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">After generate</CardTitle>
            <CardDescription>
              Edit Markdown and platform drafts in Share Studio below
              {savedId ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={`/dashboard/history/${savedId}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open in history
                  </Link>
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <GenerationSkeleton />
                <p className="text-xs text-muted-foreground">
                  Streaming patch note…
                </p>
              </div>
            ) : hasResult ? (
              <p className="text-sm text-muted-foreground">
                {platformDrafts.length} platform draft
                {platformDrafts.length === 1 ? "" : "s"} ready · scroll to Share
                Studio to edit and copy
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your patch note and social drafts will land here after generation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {hasResult ? (
        <ShareStudio
          key={savedId ?? `${tone}-${markdown.slice(0, 24)}`}
          tone={tone}
          patchNoteId={savedId}
          markdown={markdown}
          socialPost={socialPost}
          initialDrafts={platformDrafts}
          onMarkdownChange={(value) => {
            setMarkdown(value);
            setMarkdownSaved(value === baselineMarkdown);
          }}
          onSocialPostChange={setSocialPost}
          onDraftsChange={setPlatformDrafts}
          onSaveMarkdown={savedId ? handleSaveMarkdown : undefined}
          markdownDirty={!markdownSaved}
          isSavingMarkdown={isSaving}
        />
      ) : null}
    </div>
  );
}
