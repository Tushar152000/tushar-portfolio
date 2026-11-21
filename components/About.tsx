import { profile, stats } from "@/data/content";
import { Roll, Words } from "./Roll";

export default function About() {
  const items = [...stats, ...stats]; // written twice so the marquee loops seamlessly
  return (
    <>
      <section className="c-section" id="about">
        <div className="wrap">
          <div className="about__grid">
            <p className="about__creds">
              {profile.credentials.map((c, i) => (
                <span key={i}>{i === 0 ? <b>{c}</b> : c}<br /></span>
              ))}
            </p>
            <h3 className="about__text" id="aboutText"><Words text={profile.intro} /></h3>
          </div>
          <div className="cta-row">
            <a href="#contact" className="btn magnetic"><i /><Roll>Let&apos;s talk</Roll></a>
            <a href="#work" className="btn btn--ghost magnetic"><Roll>See the work</Roll></a>
            <a href={profile.resume} download={profile.resumeFileName} className="btn btn--ghost magnetic"><Roll>Download Resume ↓</Roll></a>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Quick facts">
        <div className="marquee__track" id="mq">
          {items.map((s, i) => (
            <span key={i} aria-hidden={i >= stats.length}>
              {s.value && <em>{s.value}</em>} {s.label}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
