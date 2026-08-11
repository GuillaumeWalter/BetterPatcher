import { NextResponse } from "next/server";

import * as templates from "@/lib/email/templates";

const TEMPLATE_NAMES = [
  "welcome",
  "trialActivated",
  "trialLow",
  "trialExhausted",
  "subscriptionConfirmed",
  "paymentFailed",
  "subscriptionCanceled",
  "upgradeToPro",
  "inactiveTrialReminder",
] as const;

type TemplateName = (typeof TEMPLATE_NAMES)[number];

function renderTemplate(name: TemplateName) {
  switch (name) {
    case "welcome":
      return templates.welcomeEmail("Alex");
    case "trialActivated":
      return templates.trialActivatedEmail("Alex");
    case "trialLow":
      return templates.trialLowEmail(1, "Alex");
    case "trialExhausted":
      return templates.trialExhaustedEmail("€4.99 / month", "€9.99 / month", "Alex");
    case "subscriptionConfirmed":
      return templates.subscriptionConfirmedEmail("pro", "€9.99 / month", "Alex");
    case "paymentFailed":
      return templates.paymentFailedEmail("Alex");
    case "subscriptionCanceled":
      return templates.subscriptionCanceledEmail("Alex");
    case "upgradeToPro":
      return templates.upgradeToProEmail("€4.99 / month", "€9.99 / month", "Alex");
    case "inactiveTrialReminder":
      return templates.inactiveTrialReminderEmail("Alex");
    default:
      return null;
  }
}

/** Dev-only: preview email HTML. GET /api/emails/preview?template=welcome */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const template = new URL(request.url).searchParams.get(
    "template",
  ) as TemplateName | null;

  if (!template || !TEMPLATE_NAMES.includes(template)) {
    return NextResponse.json(
      {
        templates: TEMPLATE_NAMES,
        usage: "/api/emails/preview?template=welcome",
      },
      { status: 400 },
    );
  }

  const rendered = renderTemplate(template);
  if (!rendered) {
    return NextResponse.json({ error: "Unknown template." }, { status: 404 });
  }

  return new NextResponse(rendered.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
