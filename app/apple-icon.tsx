import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: same "T_" terminal monogram as app/icon.svg (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", background: "linear-gradient(135deg, #ffd27a 0%, #ffb547 55%, #ff7a1a 100%)" }}>
        <div style={{ position: "absolute", left: 34, top: 37, width: 84, height: 25, background: "#0a0806" }} />
        <div style={{ position: "absolute", left: 65, top: 37, width: 25, height: 106, background: "#0a0806" }} />
        <div style={{ position: "absolute", left: 107, top: 124, width: 39, height: 19, background: "#0a0806" }} />
      </div>
    ),
    size
  );
}
