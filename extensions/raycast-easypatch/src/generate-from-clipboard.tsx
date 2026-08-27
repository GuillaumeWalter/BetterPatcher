import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Form,
  showToast,
  Toast,
  open,
} from "@raycast/api";
import { useEffect, useState } from "react";

import { generatePatchNote, preferences } from "./api";

export default function Command() {
  const prefs = preferences();
  const [clipboard, setClipboard] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [historyUrl, setHistoryUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const text = await Clipboard.readText();
      setClipboard(text?.trim() ?? "");
      setIsLoading(false);
    })();
  }, []);

  if (markdown) {
    return (
      <Detail
        markdown={markdown}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard title="Copy Markdown" content={markdown} />
            {historyUrl ? (
              <Action title="Open in Easy Patch" onAction={() => open(historyUrl)} />
            ) : null}
          </ActionPanel>
        }
      />
    );
  }

  if (clipboard === null) {
    return <Form isLoading />;
  }

  return (
    <Form
      key={clipboard.slice(0, 32)}
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Generate from Clipboard"
            onSubmit={async (values: { tone: string; commits: string }) => {
              const commits = (values.commits || clipboard).trim();
              if (!commits) {
                await showToast({
                  style: Toast.Style.Failure,
                  title: "Clipboard is empty",
                  message: "Copy a commit log, then run this command again.",
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
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Uses your clipboard as the commit log. Edit below if needed." />
      <Form.TextArea
        id="commits"
        title="Commits"
        defaultValue={clipboard}
        placeholder="Clipboard will appear here…"
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
