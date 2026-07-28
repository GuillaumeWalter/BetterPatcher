import { createSupabaseAdmin } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    return Response.json({ error: "Invalid email." }, { status: 400 });
  }

  if (email.length > 320) {
    return Response.json({ error: "Email is too long." }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return Response.json(
      {
        error:
          "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("waitlist_signups").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return Response.json(
        { error: "This email is already on the waitlist." },
        { status: 409 },
      );
    }

    console.error("[/api/waitlist]", error);

    return Response.json(
      { error: "Could not join the waitlist right now. Try again later." },
      { status: 500 },
    );
  }

  return Response.json({ success: true });
}
