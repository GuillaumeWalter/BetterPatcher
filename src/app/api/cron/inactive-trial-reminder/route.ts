import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { sendInactiveTrialReminderEmail } from "@/lib/email";
import { listInactiveTrialCandidates } from "@/lib/supabase/users";

/** Daily cron — remind users who verified trial but never generated. */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const candidates = await listInactiveTrialCandidates(3);
  let sent = 0;

  for (const candidate of candidates) {
    const ok = await sendInactiveTrialReminderEmail({
      userId: candidate.userId,
      email: candidate.email,
    });
    if (ok) sent += 1;
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent,
  });
}
