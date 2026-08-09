"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";

import { CommitRangePicker } from "@/components/commit-range-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImportedCommit } from "@/lib/commit-messages";

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
  const [commits, setCommits] = useState<ImportedCommit[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const frame = requestAnimationFrame(() => {
      void (async () => {
        setIsLoadingRepos(true);
        setError(null);

        try {
          const response = await fetch("/api/github/repos");
          const data = (await response.json()) as RepoOption[] & {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(data.error ?? "Could not load your repositories.");
          }

          setRepos(data);
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
            {repos.map((repo) => (
              <SelectItem key={repo.id} value={repo.fullName}>
                {repo.fullName}
                {repo.private ? " (private)" : ""}
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

      {selectedRepo && !isLoadingCommits ? (
        <CommitRangePicker
          commits={commits}
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
