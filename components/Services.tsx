import { services } from "@/data/content";

export default function Services() {
  return (
    <section className="c-section" id="services">
      <div className="wrap">
        <div className="services__head">
          <h2>What I do</h2>
          <span className="u-label"><b>{"{"}</b> Services <b>{"}"}</b></span>
        </div>
        <ol className="services__list">
          {services.map((s, i) => (
            <li key={s.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <div>
                <p>{s.text}</p>
                <div className="tags">{s.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
