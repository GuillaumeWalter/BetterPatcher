import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { PatchNoteDetail } from "@/components/patch-note-detail";
import type { Tone } from "@/lib/constants";
import { getPatchNoteForUser } from "@/lib/supabase/patch-notes";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    notFound();
  }

  const note = await getPatchNoteForUser(session.user.id, id);

  if (!note) {
    notFound();
  }

  return (
    <PatchNoteDetail
      id={note.id}
      tone={note.tone as Tone}
      repoFullName={note.repo_full_name}
      commitsRaw={note.commits_raw}
      markdown={note.markdown}
      socialPost={note.social_post}
      createdAt={note.created_at}
      updatedAt={note.updated_at}
    />
  );
}
