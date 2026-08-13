"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { ShareStudio } from "@/components/share-studio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";
import {
  seedDraftsFromSocialPost,
  type PlatformDraft,
} from "@/lib/share/platforms";

type PatchNoteDetailProps = {
  id: string;
  tone: Tone;
  repoFullName: string | null;
  commitsRaw: string;
  markdown: string;
  socialPost: string;
  platformDrafts: PlatformDraft[];
  createdAt: string;
  updatedAt: string;
  readOnly?: boolean;
  authorEmail?: string | null;
};

function toneLabel(tone: Tone) {
  return TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PatchNoteDetail({
  id,
  tone,
  repoFullName,
  commitsRaw,
  markdown: initialMarkdown,
  socialPost: initialSocialPost,
  platformDrafts: initialDrafts,
  createdAt,
  updatedAt,
  readOnly = false,
  authorEmail,
}: PatchNoteDetailProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [socialPost, setSocialPost] = useState(initialSocialPost);
  const [baselineMarkdown, setBaselineMarkdown] = useState(initialMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drafts = useMemo(
    () =>
      initialDrafts.length > 0
        ? initialDrafts
        : seedDraftsFromSocialPost(initialSocialPost, tone),
    [initialDrafts, initialSocialPost, tone],
  );

  async function handleSaveMarkdown() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/patch-notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, socialPost }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save.");
      }

      setBaselineMarkdown(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <DashboardNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {toneLabel(tone)}
            {repoFullName ? ` · ${repoFullName}` : ""}
            {readOnly && authorEmail ? ` · by ${authorEmail}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(createdAt)}
            {updatedAt !== createdAt
              ? ` · Updated ${formatDate(updatedAt)}`
              : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/history">← History</Link>
        </Button>
      </div>

      <div className="mb-6">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">Source commits</CardTitle>
            <CardDescription>Raw text used for generation</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={commitsRaw}
              className="min-h-40 resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <ShareStudio
        tone={tone}
        patchNoteId={readOnly ? null : id}
        markdown={markdown}
        socialPost={socialPost}
        initialDrafts={drafts}
        onMarkdownChange={readOnly ? undefined : setMarkdown}
        onSocialPostChange={readOnly ? undefined : setSocialPost}
        onSaveMarkdown={readOnly ? undefined : handleSaveMarkdown}
        markdownDirty={!readOnly && markdown !== baselineMarkdown}
        isSavingMarkdown={isSaving}
        readOnly={readOnly}
      />

      {readOnly ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Team view only — copy drafts or ask the author to edit.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
