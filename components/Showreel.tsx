"use client";

import { useEffect, useRef, useState } from "react";
import { createTerrain } from "@/lib/webgl";
import { motionState, recolorables } from "@/lib/state";

/** Title + live WebGL "screen" that scales to full size while pinned (see lib/motion.ts). */
export default function Showreel() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(true);
  const [rps, setRps] = useState("0000");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { motionState.on = false; setOn(false); }
    const t = ref.current ? createTerrain(ref.current, { camY: 4, amp: 1.25 }) : null;
    if (t) recolorables.add(t);
    const id = window.setInterval(() => {
      if (motionState.on) setRps(String(1200 + Math.floor(Math.random() * 900)).padStart(4, "0"));
    }, 700);
    return () => { window.clearInterval(id); if (t) { recolorables.delete(t); t.destroy(); } };
  }, []);

  const toggle = () => { motionState.on = !motionState.on; setOn(motionState.on); };

  return (
    <div className="showreel">
      <section className="showreel__head">
        <div className="wrap">
          <h2>System<br />showreel</h2>
          <p className="u-label">Live render · move your cursor</p>
        </div>
      </section>
      <section className="showreel__video" id="reel">
        <div>
          <div className="screen" id="screen">
            <canvas ref={ref} aria-hidden="true" />
            <div className="hud">
              <div className="row"><span>REQ <b>{rps}</b>/s</span><span>P95 <b>42ms</b></span><span>QUEUE <b>OK</b></span></div>
              <div className="big">Request<br />→ Response</div>
              <div className="row"><span>TC//SYS v2.0</span><span>28.67°N 77.44°E</span><span>200 OK</span></div>
            </div>
          </div>
          <div className="reel-ui">
            <span className="reel-count" id="reelN">000</span>
            <span className="reel-bar"><i id="reelBar" /></span>
            <button className="toggle" type="button" aria-pressed={!on} onClick={toggle}>
              Motion: {on ? "on" : "off"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
