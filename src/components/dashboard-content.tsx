"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { GitHubCommitImport } from "@/components/github-commit-import";
import { GitLabCommitImport } from "@/components/gitlab-commit-import";
import { sendCommitsToGenerator } from "@/lib/github-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DashboardContentProps = {
  isAuthenticated: boolean;
};

type SourceTab = "github" | "gitlab";

export function DashboardContent({ isAuthenticated }: DashboardContentProps) {
  const [commits, setCommits] = useState("");
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [source, setSource] = useState<SourceTab>("github");

  function handleImport(text: string, repo: string) {
    setCommits(text);
    setRepoFullName(repo);
  }

  return (
    <Card className="surface-card gradient-border">
      <CardHeader>
        <CardTitle className="text-lg">Import your commits</CardTitle>
        <CardDescription>
          {repoFullName
            ? `${repoFullName} | ${commits.split("\n").filter(Boolean).length} commits`
            : "Import from GitHub / GitLab or paste (Perforce, Plastic, SVN…)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 rounded-lg border border-white/10 bg-muted/30 p-1">
          <Button
            type="button"
            variant={source === "github" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setSource("github")}
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant={source === "gitlab" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setSource("gitlab")}
          >
            GitLab
          </Button>
        </div>

        {source === "github" ? (
          <GitHubCommitImport
            isAuthenticated={isAuthenticated}
            loginCallbackUrl="/dashboard"
            onImport={handleImport}
          />
        ) : (
          <GitLabCommitImport
            isAuthenticated={isAuthenticated}
            onImport={handleImport}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="dashboard-commits">Commit messages</Label>
          <Textarea
            id="dashboard-commits"
            value={commits}
            onChange={(event) => setCommits(event.target.value)}
            placeholder="Commits will appear here after an import."
            className="min-h-52 resize-y font-mono text-sm"
          />
        </div>

        <Button
          onClick={() => sendCommitsToGenerator(commits, repoFullName)}
          disabled={!commits.trim()}
        >
          Generate patch note
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
