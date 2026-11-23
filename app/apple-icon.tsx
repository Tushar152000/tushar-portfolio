import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same "TC" mark as app/icon.svg, but on a full square: iOS rounds the corners itself.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff8a24"/></linearGradient></defs>
<rect width="64" height="64" fill="url(#g)"/>
<path d="M10 19h21v7h-7v22h-7V26h-7z" fill="#0a0806"/>
<path d="M52 25.5A11 11 0 1 0 52 40.5" fill="none" stroke="#0a0806" stroke-width="7"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />
    ),
    size
  );
}
