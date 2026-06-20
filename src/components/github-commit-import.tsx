"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RepoOption = {
  id: number;
  fullName: string;
  private: boolean;
};

type GitHubCommitImportProps = {
  onImport: (commits: string, repoFullName: string) => void;
  isAuthenticated: boolean;
  loginCallbackUrl?: string;
};

export function GitHubCommitImport({
  onImport,
  isAuthenticated,
  loginCallbackUrl = "/",
}: GitHubCommitImportProps) {
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadRepos() {
      setIsLoadingRepos(true);
      setError(null);

      try {
        const response = await fetch("/api/github/repos");
        const data = (await response.json()) as RepoOption[] & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Impossible de charger vos dépôts.");
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
  }, [isAuthenticated]);

  async function handleRepoChange(fullName: string) {
    setSelectedRepo(fullName);
    setIsLoadingCommits(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/commits?repo=${encodeURIComponent(fullName)}`,
      );
      const data = (await response.json()) as { message: string }[] & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de charger les commits.");
      }

      const commits = data.map((entry) => entry.message.trim()).join("\n");
      onImport(commits, fullName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de chargement.",
      );
    } finally {
      setIsLoadingCommits(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          Connectez GitHub pour importer vos 30 derniers commits sans copier-coller.
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link href={`/login?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`}>
            <LogIn />
            Connexion GitHub
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-background/40 p-4">
      <Label htmlFor="github-repo">Importer depuis GitHub</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={selectedRepo}
          onValueChange={handleRepoChange}
          disabled={isLoadingRepos || repos.length === 0 || isLoadingCommits}
        >
          <SelectTrigger id="github-repo" className="w-full sm:flex-1">
            <SelectValue
              placeholder={
                isLoadingRepos
                  ? "Chargement des dépôts…"
                  : "Choisir un dépôt"
              }
            />
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
        {isLoadingCommits ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Commits…
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
