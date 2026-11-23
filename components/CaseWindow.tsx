"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/data/content";

/**
 * The browser-window mock on a case study. Shows the stack flow first; when the
 * case has a screenshot, it flips over to it once scrolled into view. The
 * "Flip" button in the title bar toggles between the two sides.
 */
export default function CaseWindow({ c }: { c: CaseStudy }) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!c.image || !ref.current) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // let the flow nodes animate in, then flip to the screenshot
        timer = window.setTimeout(() => { if (!touched.current) setFlipped(true); }, 1200);
      },
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, [c.image]);

  const flow = (
    <div className="flow">
      {c.flow.map((n, j) => (
        <div key={j} style={{ display: "contents" }}>
          <div className="n"><b>{n.tag}</b><span>{n.text}</span><em>{n.status}</em></div>
          {j < c.flow.length - 1 && <div className="arrow" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`win${flipped ? " is-flipped" : ""}`} ref={ref}>
      <header>
        <i /><i /><i /><span>{c.window}</span>
        {c.image && (
          <button
            type="button"
            className="win__flip"
            aria-pressed={flipped}
            onClick={() => { touched.current = true; setFlipped((f) => !f); }}
          >
            ⟲ {flipped ? "Stack" : "Screen"}
          </button>
        )}
      </header>
      {c.image ? (
        <div className="flipper">
          <div className="flipper__inner">
            <div className="face face--front" aria-hidden={flipped}>{flow}</div>
            <div className="face face--back shot" aria-hidden={!flipped}>
              <div className="shot__frame">
                <img src={c.image.src} alt={c.image.alt} loading="lazy" decoding="async" />
              </div>
              <span className="shot__chip"><i />Live · in production</span>
            </div>
          </div>
        </div>
      ) : flow}
    </div>
  );
}
