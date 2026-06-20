"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";

type RepoOption = {
  id: number;
  fullName: string;
  private: boolean;
};

type CommitOption = {
  sha: string;
  message: string;
  date: string;
};

const COMMITS_STORAGE_KEY = "release-hub-commits";
const REPO_STORAGE_KEY = "release-hub-repo";

export function DashboardContent() {
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [commits, setCommits] = useState<CommitOption[]>([]);
  const [preview, setPreview] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRepos() {
      try {
        const response = await fetch("/api/github/repos");
        const data = (await response.json()) as RepoOption[] & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Chargement des dépôts impossible.");
        }

        setRepos(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur de chargement.",
        );
      } finally {
        setIsLoadingRepos(false);
      }
    }

    loadRepos();
  }, []);

  async function loadCommits(fullName: string) {
    setSelectedRepo(fullName);
    setIsLoadingCommits(true);
    setError(null);
    setCommits([]);
    setPreview("");

    try {
      const response = await fetch(
        `/api/github/commits?repo=${encodeURIComponent(fullName)}`,
      );
      const data = (await response.json()) as CommitOption[] & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Chargement des commits impossible.");
      }

      setCommits(data);
      setPreview(
        data.map((entry) => entry.message.trim()).join("\n"),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de chargement.",
      );
    } finally {
      setIsLoadingCommits(false);
    }
  }

  function sendToGenerator() {
    if (!preview.trim()) return;
    sessionStorage.setItem(COMMITS_STORAGE_KEY, preview);
    if (selectedRepo) {
      sessionStorage.setItem(REPO_STORAGE_KEY, selectedRepo);
    }
    window.location.href = "/";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Vos dépôts</CardTitle>
          <CardDescription>
            Sélectionnez un repo pour charger les 30 derniers commits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingRepos ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Chargement des dépôts…
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="repo">Dépôt GitHub</Label>
              <Select
                value={selectedRepo}
                onValueChange={loadCommits}
                disabled={repos.length === 0}
              >
                <SelectTrigger id="repo">
                  <SelectValue placeholder="Choisir un dépôt" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.fullName}>
                      {repo.fullName}
                      {repo.private ? " (privé)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoadingCommits ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Chargement des commits…
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Commits récents</CardTitle>
          <CardDescription>
            {commits.length > 0
              ? `${commits.length} commits chargés`
              : "Choisissez un dépôt pour afficher les commits"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            readOnly
            value={preview}
            placeholder="Les messages de commit apparaîtront ici."
            className="min-h-52 resize-none font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={sendToGenerator}
              disabled={!preview.trim()}
            >
              Envoyer au générateur
              <ArrowRight />
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Outil gratuit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { COMMITS_STORAGE_KEY, REPO_STORAGE_KEY };
