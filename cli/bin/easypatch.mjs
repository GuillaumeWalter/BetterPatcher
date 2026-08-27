#!/usr/bin/env node
/**
 * Easy Patch CLI: paste or pipe a commit log → Markdown patch note.
 *
 * Auth uses the same integration token as the GitHub Action
 * (App → Settings → Integrations).
 *
 * Usage:
 *   easypatch generate -f commits.txt
 *   git log --pretty=%s -20 | easypatch generate
 *   easypatch generate --tone gaming
 */

import { readFileSync } from "node:fs";
import { stdin as stdinStream } from "node:process";

const DEFAULT_URL = "https://easypatch.app";

function printHelp() {
  console.log(`Easy Patch CLI

Generate a Markdown patch note from a commit log (stdin or file).
Works without GitHub: paste Perforce / Plastic / SVN / any text.

Usage:
  easypatch generate [options]
  easypatch help

Options:
  -f, --file <path>     Read commits from a file (default: stdin)
  -t, --tone <tone>     technical | marketing | gaming (default: technical)
  -o, --out <path>      Write markdown to a file (default: stdout)
  --repo <owner/name>   Optional repo label for history
  --tag <tag>           Optional release tag
  --json                Print full JSON response
  --url <base>          API base URL (default: EASYPATCH_URL or ${DEFAULT_URL})

Env:
  EASYPATCH_USER_ID     Required (from App → Settings → Integrations)
  EASYPATCH_TOKEN       Required
  EASYPATCH_URL         Optional API base URL

Examples:
  git log --pretty=%s ORIGIN..HEAD | easypatch generate
  easypatch generate -f changelog.txt --tone marketing -o PATCH.md
`);
}

function readArg(argv, flag, alias) {
  const i = argv.indexOf(flag);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  if (alias) {
    const j = argv.indexOf(alias);
    if (j >= 0 && argv[j + 1]) return argv[j + 1];
  }
  return null;
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdinStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function generate(argv) {
  const userId = process.env.EASYPATCH_USER_ID?.trim();
  const token = process.env.EASYPATCH_TOKEN?.trim();
  const baseUrl = (
    readArg(argv, "--url") ||
    process.env.EASYPATCH_URL ||
    DEFAULT_URL
  ).replace(/\/$/, "");

  if (!userId || !token) {
    console.error(
      "Missing EASYPATCH_USER_ID or EASYPATCH_TOKEN.\nCopy both from Easy Patch → Settings → Integrations.",
    );
    process.exit(1);
  }

  const file = readArg(argv, "--file", "-f");
  const tone = readArg(argv, "--tone", "-t") || "technical";
  const out = readArg(argv, "--out", "-o");
  const repo = readArg(argv, "--repo");
  const tag = readArg(argv, "--tag");
  const asJson = hasFlag(argv, "--json");

  let commits = "";
  if (file) {
    commits = readFileSync(file, "utf8");
  } else if (!stdinStream.isTTY) {
    commits = await readStdin();
  } else {
    console.error(
      "No commits provided. Pipe a log or pass --file <path>.\nExample: git log --pretty=%s -20 | easypatch generate",
    );
    process.exit(1);
  }

  commits = commits.trim();
  if (!commits) {
    console.error("Commit log is empty.");
    process.exit(1);
  }

  const body = {
    commits,
    tone,
    ...(repo ? { repoFullName: repo } : {}),
    ...(tag ? { tag } : {}),
  };

  const response = await fetch(`${baseUrl}/api/action/generate`, {
    method: "POST",
    headers: {
      Authorization: `EasyPatch ${userId}:${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(
      data.error || `Easy Patch API error (${response.status})`,
    );
    process.exit(1);
  }

  if (asJson) {
    const text = JSON.stringify(data, null, 2);
    if (out) {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(out, text, "utf8");
    } else {
      console.log(text);
    }
    return;
  }

  const markdown = typeof data.markdown === "string" ? data.markdown : "";
  if (out) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(out, markdown, "utf8");
    if (data.historyUrl) {
      console.error(`Saved. History: ${data.historyUrl}`);
    }
  } else {
    process.stdout.write(markdown.endsWith("\n") ? markdown : `${markdown}\n`);
  }
}

const argv = process.argv.slice(2);
const command = argv[0];

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

if (command === "generate") {
  generate(argv.slice(1)).catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exit(1);
}
