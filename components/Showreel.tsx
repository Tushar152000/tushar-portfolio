"use client";

import { useEffect, useRef, useState } from "react";
import { createTerrain } from "@/lib/webgl";
import { createReel, SCENES, type ReelHandle } from "@/lib/reel";
import { motionState, recolorables } from "@/lib/state";

/** Title + live WebGL "screen" that scales to full size while pinned (see lib/motion.ts). */
export default function Showreel() {
  const ref = useRef<HTMLCanvasElement>(null);
  const filmRef = useRef<HTMLCanvasElement>(null);
  const reel = useRef<ReelHandle | null>(null);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const [on, setOn] = useState(true);
  const [rps, setRps] = useState("0000");
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { motionState.on = false; setOn(false); }
    const t = ref.current ? createTerrain(ref.current, { camY: 4, amp: 1.25 }) : null;
    if (t) recolorables.add(t);
    const film = filmRef.current
      ? createReel(filmRef.current, {
          onScene: setScene,
          onProgress: (i, p) => fills.current.forEach((el, j) => {
            if (el) el.style.transform = `scaleX(${j < i ? 1 : j === i ? p : 0})`;
          }),
        })
      : null;
    reel.current = film;
    if (film) recolorables.add(film);
    const id = window.setInterval(() => {
      if (motionState.on) setRps(String(1200 + Math.floor(Math.random() * 900)).padStart(4, "0"));
    }, 700);
    return () => {
      window.clearInterval(id);
      if (t) { recolorables.delete(t); t.destroy(); }
      if (film) { recolorables.delete(film); film.destroy(); }
    };
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
            <canvas ref={ref} className="screen__terrain" aria-hidden="true" />
            <canvas ref={filmRef} className="screen__film" role="img" aria-label={`${SCENES[scene].title}: ${SCENES[scene].sub}`} />
            <div className="hud">
              <div className="row">{hud(scene, rps).map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}</div>
              <div className="chapters">
                {SCENES.map((sc, i) => (
                  <button key={sc.id} type="button" className={i === scene ? "is-on" : ""} onClick={() => reel.current?.seek(i)}>
                    <span className="chapters__bar"><i ref={(el) => { fills.current[i] = el; }} /></span>
                    <span>{String(i + 1).padStart(2, "0")} {sc.chapter}</span>
                  </button>
                ))}
              </div>
              <div className="scene-title" key={scene}>
                <div className="big">{SCENES[scene].title}</div>
                <p>{SCENES[scene].sub}</p>
              </div>
              <div className="row bottom"><span>TC//SYS v2.0</span><span>Scene {String(scene + 1).padStart(2, "0")}/{String(SCENES.length).padStart(2, "0")}</span><span>200 OK</span></div>
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

/** Per-scene HUD readouts (illustrative, like a monitoring overlay). */
function hud(scene: number, rps: string): [string, string][] {
  switch (SCENES[scene].id) {
    case "evt": return [["EVENTS", `${Math.round(+rps / 9)}/s`], ["LOST", "0"], ["WORKERS", "3"]];
    case "nn": return [["LAYERS", "4"], ["PARAMS", "78"], ["MODE", "train"]];
    case "rag": return [["TOP-K", "3"], ["EMBED", "1536-d"], ["TOKENS", "streaming"]];
    default: return [["REQ", `${rps}/s`], ["P95", "42ms"], ["CACHE", "hit"]];
  }
}
