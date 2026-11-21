import { Words } from "./Roll";

/** Pinned "{ WORD }" + tagline between sections. */
export default function Divider({ id, word, tagline }: { id: string; word: string; tagline: string }) {
  return (
    <section className="divider" id={id}>
      <div className="divider__sticky wrap">
        <p className="divider__word"><span className="br">{"{"}</span> {word} <span className="br">{"}"}</span></p>
        <h2 className="divider__tagline"><Words text={tagline} /></h2>
      </div>
    </section>
  );
}
