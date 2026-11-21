import { process } from "@/data/content";

export default function Process() {
  return (
    <section className="process wrap" id="process">
      {process.map((s, i) => {
        const n = String(i + 1).padStart(2, "0");
        return (
          <div className="process__card" key={s.name}>
            <div>
              <p className="u-label"><b>Step {n}</b></p>
              <div className="step">{n}</div>
            </div>
            <div>
              <h3>{s.name}</h3>
              <p className="u-copy">{s.text}</p>
              <ul className="deliv">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </div>
        );
      })}
    </section>
  );
}
