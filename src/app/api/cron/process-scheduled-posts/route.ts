import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { publishDiscordForUser } from "@/lib/share/publish-discord";
import {
  listDueScheduledPosts,
  markScheduledPostFailed,
  markScheduledPostSending,
  markScheduledPostSent,
} from "@/lib/supabase/scheduled-posts";

/** Every 5 minutes — send due Discord scheduled posts. */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const due = await listDueScheduledPosts(25);
  let sent = 0;
  let failed = 0;

  for (const post of due) {
    const locked = await markScheduledPostSending(post.id);
    if (!locked) continue;

    const result = await publishDiscordForUser(post.userId, post.content);

    if (result.ok) {
      await markScheduledPostSent(post.id);
      sent += 1;
    } else {
      await markScheduledPostFailed(post.id, result.error);
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    failed,
  });
}
