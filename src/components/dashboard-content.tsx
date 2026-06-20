"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { GitHubCommitImport } from "@/components/github-commit-import";
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

export function DashboardContent({ isAuthenticated }: DashboardContentProps) {
  const [commits, setCommits] = useState("");
  const [repoFullName, setRepoFullName] = useState<string | null>(null);

  function handleImport(text: string, repo: string) {
    setCommits(text);
    setRepoFullName(repo);
  }

  return (
    <Card className="surface-card gradient-border">
      <CardHeader>
        <CardTitle className="text-lg">Importer vos commits</CardTitle>
        <CardDescription>
          {repoFullName
            ? `${repoFullName} — ${commits.split("\n").filter(Boolean).length} commits`
            : "Sélectionnez un dépôt GitHub ou collez vos commits"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GitHubCommitImport
          isAuthenticated={isAuthenticated}
          loginCallbackUrl="/dashboard"
          onImport={handleImport}
        />

        <div className="space-y-2">
          <Label htmlFor="dashboard-commits">Messages de commit</Label>
          <Textarea
            id="dashboard-commits"
            value={commits}
            onChange={(event) => setCommits(event.target.value)}
            placeholder="Les commits apparaîtront ici après import GitHub."
            className="min-h-52 resize-y font-mono text-sm"
          />
        </div>

        <Button
          onClick={() => sendCommitsToGenerator(commits, repoFullName)}
          disabled={!commits.trim()}
        >
          Générer le patch note
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
