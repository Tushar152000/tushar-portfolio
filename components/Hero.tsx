import { profile } from "@/data/content";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <h1 className="hero__title">
          <span className="ln"><span>I ship</span></span>
          <span className="ln"><span><span className="ou">AI products</span></span></span>
          <span className="ln"><span>that scale.</span></span>
          <span className="ln"><span className="ac">Full-stack.</span></span>
        </h1>
        <div className="hero__foot u-label">
          <span className="status"><i className="pulse" />{profile.openTo}</span>
          <span>{profile.name} — {profile.role} @ {profile.company.split(" ")[0]}</span>
          <a href={profile.resume} download={profile.resumeFileName} style={{ color: "var(--accent)" }}>Download Resume ↓</a>
        </div>
      </div>
    </section>
  );
}
