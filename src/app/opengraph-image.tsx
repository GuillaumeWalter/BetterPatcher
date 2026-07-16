import { ImageResponse } from "next/og";

export const alt = "Release Hub — Patch notes IA depuis vos commits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1a1410 0%, #2d2218 45%, #1f1812 100%)",
          color: "#faf8f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #e8a04a, #d4842c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            RH
          </div>
          <span style={{ fontSize: "36px", fontWeight: 600 }}>Release Hub</span>
        </div>
        <p
          style={{
            fontSize: "56px",
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: "900px",
            margin: 0,
          }}
        >
          De vos commits au patch note, sans prise de tête
        </p>
        <p
          style={{
            fontSize: "28px",
            color: "#c4b8a8",
            marginTop: "28px",
            maxWidth: "800px",
          }}
        >
          Changelog Markdown + post réseaux · Essai gratuit puis Pro
        </p>
      </div>
    ),
    { ...size },
  );
}
