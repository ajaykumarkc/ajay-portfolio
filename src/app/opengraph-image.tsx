import { ImageResponse } from "next/og";
import { site } from "@/lib/data";

export const alt = `${site.name} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0a0a0c",
          color: "#e9e9ec",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#d9b877",
          }}
        >
          {site.location}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            {site.name}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#9c9ca5", marginTop: 24 }}>
            {`${site.title} at ${site.company}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #232329",
            paddingTop: 32,
            fontSize: 24,
            color: "#64646d",
          }}
        >
          <div>github.com/ajaykumarkc</div>
          <div style={{ color: "#d9b877" }}>{site.email}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
