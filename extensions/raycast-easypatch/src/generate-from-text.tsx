import {
  Action,
  ActionPanel,
  Detail,
  Form,
  showToast,
  Toast,
  open,
} from "@raycast/api";
import { useState } from "react";

import { generatePatchNote, preferences } from "./api";

export default function Command() {
  const prefs = preferences();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [historyUrl, setHistoryUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (markdown) {
    return (
      <Detail
        isLoading={isLoading}
        markdown={markdown}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard title="Copy Markdown" content={markdown} />
            {historyUrl ? (
              <Action title="Open in Easy Patch" onAction={() => open(historyUrl)} />
            ) : null}
            <Action
              title="Generate Again"
              onAction={() => {
                setMarkdown(null);
                setHistoryUrl(null);
              }}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Generate"
            onSubmit={async (values: { commits: string; tone: string }) => {
              const commits = values.commits?.trim();
              if (!commits) {
                await showToast({
                  style: Toast.Style.Failure,
                  title: "Paste a commit log first",
                });
                return;
              }
              setIsLoading(true);
              const result = await generatePatchNote({
                commits,
                tone: values.tone,
              });
              setIsLoading(false);
              if (!result.ok || !result.markdown) {
                await showToast({
                  style: Toast.Style.Failure,
                  title: "Generation failed",
                  message: result.error,
                });
                return;
              }
              setMarkdown(result.markdown);
              setHistoryUrl(result.historyUrl ?? null);
              await showToast({
                style: Toast.Style.Success,
                title: "Patch note ready",
                message:
                  typeof result.generationsRemaining === "number"
                    ? `${result.generationsRemaining} generations left`
                    : undefined,
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="commits"
        title="Commits"
        placeholder="Paste Perforce / Plastic / SVN / git log…"
        enableMarkdown={false}
      />
      <Form.Dropdown
        id="tone"
        title="Tone"
        defaultValue={prefs.defaultTone || "technical"}
      >
        <Form.Dropdown.Item value="technical" title="Technical" />
        <Form.Dropdown.Item value="marketing" title="Marketing" />
        <Form.Dropdown.Item value="gaming" title="Gaming" />
      </Form.Dropdown>
    </Form>
  );
}
