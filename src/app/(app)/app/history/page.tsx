import Link from "next/link";

import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { OnboardingHistoryMarker } from "@/components/onboarding-history-marker";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TONE_OPTIONS } from "@/lib/constants";
import { APP } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { listPatchNotesForUser } from "@/lib/supabase/patch-notes";

export const metadata = pageMetadata({
  title: "History",
  description: "Browse generated patch notes and the commits used to create them.",
  path: APP.history,
  noIndex: true,
});

function toneLabel(tone: string) {
  return TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function HistoryPage() {
  const session = await auth();
  const notes = session?.user?.id
    ? await listPatchNotesForUser(session.user.id)
    : [];

  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          History
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every generated note keeps the source commits (or pasted log) used in
          the text. Open one to edit, share, or copy drafts.
        </p>
      </div>

      <OnboardingHistoryMarker />
      <AppNav />

      {notes.length === 0 ? (
        <Card className="surface-card gradient-border">
          <CardHeader>
            <CardTitle className="text-lg">No history yet</CardTitle>
            <CardDescription>
              Generate a patch note while signed in to see it appear here. Pro
              teams share history across seats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={APP.generate}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open the generator →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <Link href={APP.historyItem(note.id)}>
                <Card className="surface-card gradient-border transition-all hover:shadow-md hover:shadow-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-medium">
                        {note.repoFullName ?? "Pasted commits"}
                      </CardTitle>
                      <Badge variant="secondary">{toneLabel(note.tone)}</Badge>
                      <Badge variant="outline">
                        {note.commitLineCount} source line
                        {note.commitLineCount === 1 ? "" : "s"}
                      </Badge>
                      {!note.isOwn && note.authorEmail ? (
                        <Badge variant="outline">
                          Team · {note.authorEmail}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription>
                      {formatDate(note.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {note.commitsPreview ? (
                      <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
                        Sources: {note.commitsPreview}
                      </p>
                    ) : null}
                    <p className="line-clamp-2 font-mono text-sm text-muted-foreground">
                      {note.markdownPreview}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
