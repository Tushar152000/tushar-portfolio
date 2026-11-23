import { ImageResponse } from "next/og";
import { profile } from "@/data/content";

export const alt = `${profile.name} — ${profile.role}. I ship AI products that scale.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card for LinkedIn, X, WhatsApp, Slack etc. Mirrors the hero. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0a0806", color: "#f3ede4", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}>
          <span style={{ display: "flex" }}>TUSHAR<span style={{ color: "#ffb547" }}>.</span></span>
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: "#5fd38d", letterSpacing: 2, fontSize: 20 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: "#5fd38d" }} />
            Open to SDE II · Full-Stack · Backend · AI
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 0.95, fontWeight: 600, letterSpacing: -3, textTransform: "uppercase" }}>
          <span>I ship AI products</span>
          <span>that scale.</span>
          <span style={{ color: "#ffb547" }}>Full-stack.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #2a2219", paddingTop: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 600 }}>{profile.name}</span>
            <span style={{ fontSize: 24, color: "#9a8f80" }}>{profile.role} @ {profile.company}</span>
          </div>
          <span style={{ fontSize: 22, color: "#9a8f80" }}>Next.js · Node.js · TypeScript · GPT-4o · GCP · AWS</span>
        </div>
      </div>
    ),
    size
  );
}
