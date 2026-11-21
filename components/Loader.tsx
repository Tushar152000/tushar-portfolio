export default function Loader() {
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <div className="name">
        {"TUSHAR".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
      <div className="meta">
        BOOTING SYSTEM · <b id="ldN">000</b>
      </div>
    </div>
  );
}
