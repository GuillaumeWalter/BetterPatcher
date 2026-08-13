"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LogIn, Star } from "lucide-react";
import Link from "next/link";

import { CommitRangePicker } from "@/components/commit-range-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImportedCommit } from "@/lib/commit-messages";
import { cn } from "@/lib/utils";

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [commits, setCommits] = useState<ImportedCommit[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedRepos = useMemo(() => {
    const favoriteSet = new Set(favorites);
    const fav = repos.filter((r) => favoriteSet.has(r.fullName));
    const rest = repos.filter((r) => !favoriteSet.has(r.fullName));
    return { fav, rest };
  }, [repos, favorites]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const frame = requestAnimationFrame(() => {
      void (async () => {
        setIsLoadingRepos(true);
        setError(null);

        try {
          const [reposResponse, favResponse] = await Promise.all([
            fetch("/api/github/repos"),
            fetch("/api/favorites/repos", { credentials: "same-origin" }),
          ]);

          const data = (await reposResponse.json()) as RepoOption[] & {
            error?: string;
          };

          if (!reposResponse.ok) {
            throw new Error(data.error ?? "Could not load your repositories.");
          }

          setRepos(data);

          if (favResponse.ok) {
            const favData = (await favResponse.json()) as { favorites?: string[] };
            setFavorites(favData.favorites ?? []);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load.");
        } finally {
          setIsLoadingRepos(false);
        }
      })();
    });

    return () => cancelAnimationFrame(frame);
  }, [isAuthenticated]);

  async function handleRepoChange(fullName: string) {
    setSelectedRepo(fullName);
    setCommits([]);
    setIsLoadingCommits(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/commits?repo=${encodeURIComponent(fullName)}`,
      );
      const data = (await response.json()) as ImportedCommit[] & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load commits.");
      }

      setCommits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setIsLoadingCommits(false);
    }
  }

  async function toggleFavorite() {
    if (!selectedRepo) return;
    setIsTogglingFavorite(true);
    try {
      const response = await fetch("/api/favorites/repos", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: selectedRepo }),
      });
      const data = (await response.json()) as { favorites?: string[] };
      if (response.ok && data.favorites) {
        setFavorites(data.favorites);
      }
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          Connect GitHub to pick commits from a repository without copy paste.
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link href={`/login?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`}>
            <LogIn />
            Sign in with GitHub
          </Link>
        </Button>
      </div>
    );
  }

  const isFavorite = favorites.includes(selectedRepo);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-background/40 p-4">
      <Label htmlFor="github-repo">Import from GitHub</Label>
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
                  ? "Loading repositories…"
                  : "Choose a repository"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sortedRepos.fav.length > 0 ? (
              <SelectGroup>
                <SelectLabel>Favorites</SelectLabel>
                {sortedRepos.fav.map((repo) => (
                  <SelectItem key={repo.id} value={repo.fullName}>
                    ★ {repo.fullName}
                    {repo.private ? " (private)" : ""}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : null}
            {sortedRepos.rest.length > 0 ? (
              <SelectGroup>
                {sortedRepos.fav.length > 0 ? (
                  <SelectLabel>All repositories</SelectLabel>
                ) : null}
                {sortedRepos.rest.map((repo) => (
                  <SelectItem key={repo.id} value={repo.fullName}>
                    {repo.fullName}
                    {repo.private ? " (private)" : ""}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : null}
          </SelectContent>
        </Select>
        {selectedRepo ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={isTogglingFavorite}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={cn(
                "size-4",
                isFavorite ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
          </Button>
        ) : null}
        {isLoadingCommits ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Commits…
          </span>
        ) : null}
      </div>

      {selectedRepo && !isLoadingCommits ? (
        <CommitRangePicker
          commits={commits}
          repoFullName={selectedRepo}
          onConfirm={(text) => onImport(text, selectedRepo)}
        />
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {!isLoadingRepos && repos.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">
          No repositories found for this GitHub account.
        </p>
      ) : null}
    </div>
  );
}
