import Link from "next/link";

import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TONE_OPTIONS } from "@/lib/constants";
import { listPatchNotesForUser } from "@/lib/supabase/patch-notes";

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
      <DashboardNav />
      <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Your generated patch notes are saved here. Click to view or edit.
      </p>

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
              href="/dashboard/generate"
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
              <Link href={`/dashboard/history/${note.id}`}>
                <Card className="surface-card gradient-border transition-all hover:shadow-md hover:shadow-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-medium">
                        {note.repoFullName ?? "Pasted commits"}
                      </CardTitle>
                      <Badge variant="secondary">{toneLabel(note.tone)}</Badge>
                      {!note.isOwn && note.authorEmail ? (
                        <Badge variant="outline">Team · {note.authorEmail}</Badge>
                      ) : null}
                    </div>
                    <CardDescription>{formatDate(note.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
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
