import { appUrl } from "@/lib/email/client";

type LayoutOptions = {
  preheader?: string;
  body: string;
};

export function emailLayout({ preheader, body }: LayoutOptions): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Easy Patch</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:system-ui,-apple-system,sans-serif;color:#3d342c;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e8e0d6;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;background:linear-gradient(135deg,#e8a04a,#d4842c);">
              <p style="margin:0;font-size:18px;font-weight:700;color:#1a1410;">Easy Patch</p>
              <p style="margin:4px 0 0;font-size:13px;color:#1a1410;opacity:0.85;">Commits → patch notes → social posts</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-size:12px;color:#8a7f72;line-height:1.5;">
              <p style="margin:0 0 8px;">You're receiving this because you use Easy Patch.</p>
              <p style="margin:0;">
                <a href="${appUrl("/dashboard/billing")}" style="color:#c47f2a;">Manage billing</a>
                ·
                <a href="${appUrl("/contact")}" style="color:#c47f2a;">Contact support</a>
              </p>
              <p style="margin:12px 0 0;">© ${year} Easy Patch</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(label: string, href: string): string {
  return `<p style="margin:24px 0 0;">
    <a href="${href}" style="display:inline-block;background:#d4842c;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;">${label}</a>
  </p>`;
}

export function priceBox(lines: string[]): string {
  const items = lines.map((line) => `<li style="margin:6px 0;">${line}</li>`).join("");
  return `<div style="margin:20px 0;padding:16px;background:#faf8f5;border-radius:12px;border:1px solid #e8e0d6;">
    <ul style="margin:0;padding-left:20px;color:#5c534a;">${items}</ul>
  </div>`;
}
