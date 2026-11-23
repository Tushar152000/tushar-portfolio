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
        <div className="hero__foot">
          <span className="status status--hero"><i className="pulse" />{profile.openTo}</span>
          <span className="hero__who">
            <b>{profile.name}</b>
            <span>{profile.role} @ {profile.company.split(" ")[0]}</span>
          </span>
          <a className="hero__cv" href={profile.resume} download={profile.resumeFileName} data-resume>Download Resume ↓</a>
        </div>
      </div>
    </section>
  );
}
