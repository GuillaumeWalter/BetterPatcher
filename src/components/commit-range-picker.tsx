"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { messagesForGenerator, type ImportedCommit } from "@/lib/commit-messages";

type CommitRangePickerProps = {
  commits: ImportedCommit[];
  onConfirm: (commitsText: string) => void;
};

function formatCommitDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function CommitRangePicker({
  commits,
  onConfirm,
}: CommitRangePickerProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(commits.map((commit) => commit.sha)),
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSelected(new Set(commits.map((commit) => commit.sha)));
    });
    return () => cancelAnimationFrame(frame);
  }, [commits]);

  function toggleSha(sha: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(sha);
      else next.delete(sha);
      return next;
    });
  }

  /** Newest → this commit (inclusive). List is newest first. */
  function selectFromHere(index: number) {
    setSelected(new Set(commits.slice(0, index + 1).map((commit) => commit.sha)));
  }

  function selectAll() {
    setSelected(new Set(commits.map((commit) => commit.sha)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  function handleConfirm() {
    const messages = commits
      .filter((commit) => selected.has(commit.sha))
      .map((commit) => commit.message);
    onConfirm(messagesForGenerator(messages));
  }

  const selectedCount = selected.size;

  if (commits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No usable commits in the latest history (merge commits are skipped).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Newest first · {selectedCount} of {commits.length} selected
        </p>
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
            All
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={selectNone}>
            None
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: use <span className="font-medium text-foreground">From here</span>{" "}
        on an older commit to take everything since then, then uncheck noise.
      </p>

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-background/50 p-2">
        {commits.map((commit, index) => {
          const checked = selected.has(commit.sha);
          return (
            <li
              key={`${commit.sha}-${index}`}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  toggleSha(commit.sha, value === true)
                }
                className="mt-0.5"
                aria-label={`Select ${commit.message}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{commit.message}</p>
                <p className="text-xs text-muted-foreground">
                  {commit.sha}
                  {commit.date ? ` · ${formatCommitDate(commit.date)}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => selectFromHere(index)}
              >
                From here
              </Button>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        className="w-full"
        disabled={selectedCount === 0}
        onClick={handleConfirm}
      >
        Use {selectedCount} commit{selectedCount === 1 ? "" : "s"}
      </Button>
    </div>
  );
}
