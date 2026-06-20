"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Loader2, Wand2 } from "lucide-react";

import {
  COMMITS_STORAGE_KEY,
  REPO_STORAGE_KEY,
} from "@/components/dashboard-content";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_GENERATION_OPTIONS,
  GENERATION_OPTION_DEFS,
  TONE_OPTIONS,
  type GenerationOptions,
  type Tone,
} from "@/lib/constants";

const PLACEHOLDER_COMMITS = `feat(auth): add OAuth GitHub login
fix(api): resolve race condition on webhook delivery
chore(deps): bump next.js to 16.2
docs: update deployment guide`;

export function PatchNoteGenerator() {
  const [commits, setCommits] = useState("");
  const [tone, setTone] = useState<Tone>("technical");
  const [options, setOptions] = useState<GenerationOptions>(
    DEFAULT_GENERATION_OPTIONS,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [socialPost, setSocialPost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  async function handleGenerate() {
    if (!commits.trim()) return;

    setIsLoading(true);
    setMarkdown("");
    setSocialPost("");
    setError(null);
    setSavedId(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commits, tone, repoFullName, options }),
      });

      const data = (await response.json()) as {
        markdown?: string;
        socialPost?: string;
        savedId?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "La génération a échoué.");
      }

      setMarkdown(data.markdown ?? "");
      setSocialPost(data.socialPost ?? "");
      setSavedId(data.savedId ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Vos commits</CardTitle>
          <CardDescription>
            Collez les messages de commit bruts (git log, squash, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="commits">Messages de commit</Label>
            <Textarea
              id="commits"
              placeholder={PLACEHOLDER_COMMITS}
              value={commits}
              onChange={(event) => setCommits(event.target.value)}
              className="min-h-52 resize-y font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tonalité</Label>
            <Select
              value={tone}
              onValueChange={(value) => setTone(value as Tone)}
            >
              <SelectTrigger id="tone" className="w-full">
                <SelectValue placeholder="Choisir une tonalité" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {option.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Options de mise en forme</Label>
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

          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={isLoading || !commits.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <Wand2 />
                Générer le patch note
              </>
            )}
          </Button>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Résultat</CardTitle>
          <CardDescription>
            Markdown propre et post réseaux prêt à copier
            {savedId ? (
              <>
                {" "}
                ·{" "}
                <Link
                  href={`/dashboard/history/${savedId}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Voir dans l&apos;historique
                </Link>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="markdown" className="w-full">
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="markdown" className="flex-1">
                Markdown clean
              </TabsTrigger>
              <TabsTrigger value="social" className="flex-1">
                Post réseaux
              </TabsTrigger>
            </TabsList>

            <TabsContent value="markdown" className="mt-4 space-y-3">
              <Textarea
                readOnly
                value={markdown}
                placeholder="Le patch note apparaîtra ici après génération."
                className="min-h-52 resize-none font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!markdown}
                onClick={() => copyToClipboard(markdown)}
              >
                <Copy />
                Copier le Markdown
              </Button>
            </TabsContent>

            <TabsContent value="social" className="mt-4 space-y-3">
              <Textarea
                readOnly
                value={socialPost}
                placeholder="Le post LinkedIn / X apparaîtra ici après génération."
                className="min-h-52 resize-none text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!socialPost}
                onClick={() => copyToClipboard(socialPost)}
              >
                <Copy />
                Copier le post
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
