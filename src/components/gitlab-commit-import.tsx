"use client";

import { useEffect, useState } from "react";
import { Loader2, Unplug } from "lucide-react";

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

type GitLabCommitImportProps = {
  onImport: (commits: string, repoFullName: string) => void;
  isAuthenticated: boolean;
};

export function GitLabCommitImport({
  onImport,
  isAuthenticated,
}: GitLabCommitImportProps) {
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    setIsLoadingStatus(true);
    setError(null);
    try {
      const response = await fetch("/api/gitlab/status");
      const data = (await response.json()) as {
        connected?: boolean;
        configured?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not check GitLab status.");
      }
      setConnected(Boolean(data.connected));
      setConfigured(data.configured !== false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setIsLoadingStatus(false);
    }
  }

  async function loadRepos() {
    setIsLoadingRepos(true);
    setError(null);
    try {
      const response = await fetch("/api/gitlab/repos");
      const data = (await response.json()) as RepoOption[] & {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        if (data.code === "gitlab_not_connected") {
          setConnected(false);
        }
        throw new Error(data.error ?? "Could not load your projects.");
      }
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setIsLoadingRepos(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingStatus(false);
      return;
    }
    loadStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    if (connected) {
      loadRepos();
    } else {
      setRepos([]);
      setSelectedRepo("");
    }
  }, [connected]);

  async function handleDisconnect() {
    setError(null);
    try {
      const response = await fetch("/api/gitlab/status", { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not disconnect.");
      }
      setConnected(false);
      setRepos([]);
      setSelectedRepo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect.");
    }
  }

  async function handleRepoChange(fullName: string) {
    const repo = repos.find((entry) => entry.fullName === fullName);
    setSelectedRepo(fullName);
    setIsLoadingCommits(true);
    setError(null);

    try {
      const params = new URLSearchParams({ project: fullName });
      if (repo) params.set("projectId", String(repo.id));

      const response = await fetch(`/api/gitlab/commits?${params.toString()}`);
      const data = (await response.json()) as { message: string }[] & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load commits.");
      }

      const commits = data.map((entry) => entry.message.trim()).join("\n");
      onImport(commits, fullName);
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
          Sign in to connect GitLab and import your last 30 commits.
        </p>
      </div>
    );
  }

  if (isLoadingStatus) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking GitLab…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
        GitLab OAuth is not configured on this deployment yet
        (AUTH_GITLAB_ID / AUTH_GITLAB_SECRET).
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          Connect GitLab to import projects without copy paste. Your GitHub
          login stays the same.
        </p>
        <Button asChild size="sm" className="mt-3">
          <a href="/api/gitlab/connect">Connect GitLab</a>
        </Button>
        {error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="gitlab-repo">Import from GitLab</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
        >
          <Unplug />
          Disconnect
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={selectedRepo}
          onValueChange={handleRepoChange}
          disabled={isLoadingRepos || repos.length === 0 || isLoadingCommits}
        >
          <SelectTrigger id="gitlab-repo" className="w-full sm:flex-1">
            <SelectValue
              placeholder={
                isLoadingRepos
                  ? "Loading projects…"
                  : "Choose a project"
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
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
