"use client";

import { useEffect, useState } from "react";
import { palettes } from "@/data/content";
import { recolorAll } from "@/lib/state";

const KEY = "tc-palette";

export default function ThemeDock() {
  const [active, setActive] = useState("");

  const apply = (id: string, save: boolean) => {
    const root = document.documentElement;
    if (id) root.dataset.palette = id;
    else delete root.dataset.palette;
    setActive(id);
    recolorAll();
    if (save) {
      try { localStorage.setItem(KEY, id); } catch { /* storage unavailable */ }
    }
  };

  useEffect(() => {
    let saved = "";
    try { saved = localStorage.getItem(KEY) || ""; } catch { /* storage unavailable */ }
    apply(saved, false);
    // WebGL fields may start after this; recolour again once they exist
    const t = window.setTimeout(recolorAll, 1800);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="dock" role="group" aria-label="Colour theme">
      <span>Theme</span>
      {palettes.map((p) => (
        <button
          key={p.id || "default"}
          type="button"
          aria-label={p.label}
          aria-pressed={active === p.id}
          style={{ background: p.swatch }}
          onClick={() => apply(p.id, true)}
        />
      ))}
    </div>
  );
}
