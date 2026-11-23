import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the same "T." monogram as app/icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0a0806", position: "relative", display: "flex" }}>
        <div style={{ position: "absolute", left: 34, top: 40, width: 84, height: 22, background: "#f3ede4" }} />
        <div style={{ position: "absolute", left: 65, top: 40, width: 22, height: 100, background: "#f3ede4" }} />
        <div style={{ position: "absolute", left: 118, top: 118, width: 22, height: 22, background: "#ffb547" }} />
      </div>
    ),
    size
  );
}
