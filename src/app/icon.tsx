import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #e8a04a, #d4842c)",
          color: "#1a1410",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        RH
      </div>
    ),
    { ...size },
  );
}
