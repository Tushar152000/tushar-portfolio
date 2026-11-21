import { cases } from "@/data/content";
import { Roll } from "./Roll";

export default function CaseStudies() {
  return (
    <section className="wrap" id="work">
      {cases.map((c, i) => {
        const idx = String(i + 1).padStart(2, "0");
        return (
          <article className="case" key={c.name}>
            <div className="case__media">
              <span className="idx">{idx}</span>
              <div className="win">
                <header><i /><i /><i /><span>{c.window}</span></header>
                <div className="flow">
                  {c.flow.map((n, j) => (
                    <div key={j} style={{ display: "contents" }}>
                      <div className="n"><b>{n.tag}</b><span>{n.text}</span><em>{n.status}</em></div>
                      {j < c.flow.length - 1 && <div className="arrow" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="case__info">
              <span className="case__index">{idx} / {c.meta}</span>
              <h3 className="case__name">{c.name}</h3>
              <p className="case__desc">{c.description}</p>
              <a
                className="btn btn--ghost magnetic"
                href={c.cta.href}
                {...(c.cta.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                <Roll>{c.cta.label}</Roll>
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
