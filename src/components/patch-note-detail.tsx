"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Loader2, Save } from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";

type PatchNoteDetailProps = {
  id: string;
  tone: Tone;
  repoFullName: string | null;
  commitsRaw: string;
  markdown: string;
  socialPost: string;
  createdAt: string;
  updatedAt: string;
};

function toneLabel(tone: Tone) {
  return TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
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
  createdAt,
  updatedAt,
}: PatchNoteDetailProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [socialPost, setSocialPost] = useState(initialSocialPost);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    markdown !== initialMarkdown || socialPost !== initialSocialPost;

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/patch-notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, socialPost }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Sauvegarde impossible.");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <>
      <DashboardNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {toneLabel(tone)}
            {repoFullName ? ` · ${repoFullName}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Créé {formatDate(createdAt)}
            {updatedAt !== createdAt ? ` · Modifié ${formatDate(updatedAt)}` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/history">← Historique</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">Commits source</CardTitle>
            <CardDescription>Texte brut utilisé pour la génération</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={commitsRaw}
              className="min-h-48 resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">Contenu éditable</CardTitle>
            <CardDescription>
              Ajustez le Markdown et le post avant publication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="markdown">
              <TabsList className="w-full bg-muted/50">
                <TabsTrigger value="markdown" className="flex-1">
                  Markdown
                </TabsTrigger>
                <TabsTrigger value="social" className="flex-1">
                  Post réseaux
                </TabsTrigger>
              </TabsList>

              <TabsContent value="markdown" className="mt-4 space-y-3">
                <Label htmlFor="markdown" className="sr-only">
                  Markdown
                </Label>
                <Textarea
                  id="markdown"
                  value={markdown}
                  onChange={(event) => {
                    setMarkdown(event.target.value);
                    setSaved(false);
                  }}
                  className="min-h-48 resize-y font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(markdown)}
                >
                  <Copy />
                  Copier
                </Button>
              </TabsContent>

              <TabsContent value="social" className="mt-4 space-y-3">
                <Label htmlFor="social" className="sr-only">
                  Post réseaux
                </Label>
                <Textarea
                  id="social"
                  value={socialPost}
                  onChange={(event) => {
                    setSocialPost(event.target.value);
                    setSaved(false);
                  }}
                  className="min-h-48 resize-y text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(socialPost)}
                >
                  <Copy />
                  Copier
                </Button>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Sauvegarde…
                  </>
                ) : (
                  <>
                    <Save />
                    Enregistrer
                  </>
                )}
              </Button>
              {saved ? (
                <span className="text-sm text-muted-foreground">
                  Modifications enregistrées
                </span>
              ) : null}
              {error ? (
                <span className="text-sm text-destructive" role="alert">
                  {error}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
