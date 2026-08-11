"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GenerationSkeleton } from "@/components/generation-skeleton";
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

const PLACEHOLDER = `feat(auth): add OAuth login
fix(api): resolve webhook race
docs: update changelog`;

export function DemoPatchGenerator() {
  const [commits, setCommits] = useState("");
  const [tone, setTone] = useState<Tone>("technical");
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [socialPost, setSocialPost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [copied, setCopied] = useState<"markdown" | "social" | null>(null);

  async function handleGenerate() {
    if (!commits.trim()) return;

    setIsLoading(true);
    setMarkdown("");
    setSocialPost("");
    setError(null);
    setLiveMessage("Generating demo patch note…");

    try {
      const response = await fetch("/api/generate/demo", {
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
        throw new Error(data.error ?? "Generation failed.");
      }

      setMarkdown(data.markdown ?? "");
      setSocialPost(data.socialPost ?? "");
      setLiveMessage("Demo patch note ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLiveMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function copy(text: string, field: "markdown" | "social") {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(field);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <p className="sr-only lg:col-span-2" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Try it free</CardTitle>
          <CardDescription>
            3 demo generations per hour per IP. No account required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-commits">Paste commits</Label>
            <Textarea
              id="demo-commits"
              value={commits}
              onChange={(e) => setCommits(e.target.value)}
              placeholder={PLACEHOLDER}
              className="min-h-40 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-tone">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger id="demo-tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isLoading || !commits.trim()}
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
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Want history, GitHub/GitLab import, and Share Studio?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Create a free account
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Result</CardTitle>
          <CardDescription>Markdown + social post ready to copy</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <GenerationSkeleton />
          ) : (
          <Tabs defaultValue="markdown">
            <TabsList className="w-full">
              <TabsTrigger value="markdown" className="flex-1">
                Markdown
              </TabsTrigger>
              <TabsTrigger value="social" className="flex-1">
                Social
              </TabsTrigger>
            </TabsList>
            <TabsContent value="markdown" className="mt-4 space-y-3">
              <Textarea
                readOnly
                value={markdown}
                placeholder="Your patch note appears here."
                className="min-h-40 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!markdown}
                onClick={() => copy(markdown, "markdown")}
              >
                <Copy />
                {copied === "markdown" ? "Copied!" : "Copy Markdown"}
              </Button>
            </TabsContent>
            <TabsContent value="social" className="mt-4 space-y-3">
              <Textarea
                readOnly
                value={socialPost}
                placeholder="Your social post appears here."
                className="min-h-40 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!socialPost}
                onClick={() => copy(socialPost, "social")}
              >
                <Copy />
                {copied === "social" ? "Copied!" : "Copy post"}
              </Button>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
