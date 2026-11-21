import { profile } from "@/data/content";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <h1 className="hero__title">
          <span className="ln"><span>Every product</span></span>
          <span className="ln"><span>is a <span className="ou">request.</span></span></span>
          <span className="ln"><span>I build the</span></span>
          <span className="ln"><span className="ac">response.</span></span>
        </h1>
        <div className="hero__foot u-label">
          <span className="status"><i className="pulse" />{profile.openTo}</span>
          <span>{profile.name} — {profile.role} @ {profile.company.split(" ")[0]}</span>
          <a href={profile.resume} target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>Resume ↗</a>
        </div>
      </div>
    </section>
  );
}
