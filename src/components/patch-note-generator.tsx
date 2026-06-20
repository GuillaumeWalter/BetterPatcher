"use client";

import { useState } from "react";
import { Copy, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { TONE_OPTIONS, type Tone } from "@/lib/constants";

const PLACEHOLDER_COMMITS = `feat(auth): add OAuth GitHub login
fix(api): resolve race condition on webhook delivery
chore(deps): bump next.js to 16.2
docs: update deployment guide`;

export function PatchNoteGenerator() {
  const [commits, setCommits] = useState("");
  const [tone, setTone] = useState<Tone>("technical");
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [socialPost, setSocialPost] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!commits.trim()) return;

    setIsLoading(true);
    setMarkdown("");
    setSocialPost("");
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commits, tone }),
      });

      const data = (await response.json()) as {
        markdown?: string;
        socialPost?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "La génération a échoué.");
      }

      setMarkdown(data.markdown ?? "");
      setSocialPost(data.socialPost ?? "");
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
      <Card className="border-border/60 bg-card/50">
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

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Résultat</CardTitle>
          <CardDescription>
            Markdown propre et post réseaux prêt à copier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="markdown" className="w-full">
            <TabsList className="w-full">
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
