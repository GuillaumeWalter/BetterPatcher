import type { PlatformDraft } from "@/lib/share/platforms";

export type StreamPartial = {
  markdown?: string;
  socialPost?: string;
  platformDrafts?: PlatformDraft[];
};

export type StreamDonePayload = StreamPartial & {
  savedId?: string | null;
  generationsRemaining?: number;
};

export async function consumeGenerationStream(
  response: Response,
  onPartial: (data: StreamPartial) => void,
): Promise<StreamDonePayload> {
  if (!response.ok) {
    const data = (await response.json()) as { error?: string; code?: string };
    const error = new Error(data.error ?? "Generation failed.");
    (error as Error & { code?: string }).code = data.code;
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload: StreamDonePayload | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const message = JSON.parse(line) as {
        type: string;
        data?: StreamDonePayload;
        error?: string;
      };

      if (message.type === "partial" && message.data) {
        onPartial(message.data);
      }

      if (message.type === "done" && message.data) {
        donePayload = message.data;
      }

      if (message.type === "error") {
        throw new Error(message.error ?? "Generation failed.");
      }
    }
  }

  if (!donePayload) {
    throw new Error("Generation ended without a result.");
  }

  return donePayload;
}
