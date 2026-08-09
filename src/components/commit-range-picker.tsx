"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  messagesForGenerator,
  type ImportedCommit,
} from "@/lib/commit-messages";
import {
  getRememberedImport,
  isCommitRemembered,
  rememberImportedCommits,
  type RememberedImport,
} from "@/lib/import-memory";

type CommitRangePickerProps = {
  commits: ImportedCommit[];
  repoFullName: string;
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

function defaultSelection(
  commits: ImportedCommit[],
  remembered: RememberedImport | null,
): Set<string> {
  if (!remembered || (remembered.shas.length === 0 && remembered.messages.length === 0)) {
    return new Set(commits.map((commit) => commit.sha));
  }

  const fresh = commits.filter(
    (commit) => !isCommitRemembered(commit, remembered),
  );
  if (fresh.length > 0) {
    return new Set(fresh.map((commit) => commit.sha));
  }

  return new Set();
}

export function CommitRangePicker({
  commits,
  repoFullName,
  onConfirm,
}: CommitRangePickerProps) {
  const [remembered, setRemembered] = useState<RememberedImport | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const memory = getRememberedImport(repoFullName);
      setRemembered(memory);
      setSelected(defaultSelection(commits, memory));
    });
    return () => cancelAnimationFrame(frame);
  }, [commits, repoFullName]);

  const newCount = useMemo(
    () =>
      commits.filter((commit) => !isCommitRemembered(commit, remembered))
        .length,
    [commits, remembered],
  );

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

  function selectNewOnly() {
    setSelected(
      new Set(
        commits
          .filter((commit) => !isCommitRemembered(commit, remembered))
          .map((commit) => commit.sha),
      ),
    );
  }

  function handleConfirm() {
    const chosen = commits.filter((commit) => selected.has(commit.sha));
    rememberImportedCommits(repoFullName, chosen);
    setRemembered(getRememberedImport(repoFullName));
    onConfirm(messagesForGenerator(chosen.map((commit) => commit.message)));
  }

  const selectedCount = selected.size;
  const hasMemory =
    Boolean(remembered) &&
    ((remembered?.shas.length ?? 0) > 0 ||
      (remembered?.messages.length ?? 0) > 0);

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
          {hasMemory ? ` · ${newCount} new` : ""}
        </p>
        <div className="flex flex-wrap gap-1">
          {hasMemory ? (
            <Button type="button" variant="ghost" size="sm" onClick={selectNewOnly}>
              New only
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
            All
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={selectNone}>
            None
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasMemory ? (
          <>
            <span className="font-medium text-foreground">New</span> commits
            were not in your last import / generation for this repo.{" "}
            <span className="font-medium text-foreground">Used</span> ones
            already were. Default: new only.
          </>
        ) : (
          <>
            Tip: use{" "}
            <span className="font-medium text-foreground">From here</span> on
            an older commit to take everything since then, then uncheck noise.
          </>
        )}
      </p>

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-background/50 p-2">
        {commits.map((commit, index) => {
          const checked = selected.has(commit.sha);
          const used = isCommitRemembered(commit, remembered);
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
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-medium">{commit.message}</p>
                  {hasMemory ? (
                    <span
                      className={
                        used
                          ? "shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                          : "shrink-0 rounded-md bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary"
                      }
                    >
                      {used ? "Used" : "New"}
                    </span>
                  ) : null}
                </div>
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
