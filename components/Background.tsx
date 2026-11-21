"use client";

import { useEffect, useRef } from "react";
import { createCodeField } from "@/lib/webgl";
import { recolorables } from "@/lib/state";

/** Fixed 3D "floating code" field, vignette, scanlines and the custom cursor. */
export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let field: ReturnType<typeof createCodeField> = null;
    let cancelled = false;
    const start = () => {
      if (cancelled || field || !ref.current) return;
      field = createCodeField(ref.current);
      if (field) recolorables.add(field);
    };
    // wait for the mono font so code sprites render in JetBrains Mono
    document.fonts?.ready.then(start, start);
    const fallback = window.setTimeout(start, 1500);

    const onScroll = () => {
      if (ref.current) ref.current.style.opacity = window.scrollY > window.innerHeight * 0.7 ? "0.55" : "1";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("scroll", onScroll);
      if (field) { recolorables.delete(field); field.destroy(); }
    };
  }, []);

  return (
    <>
      <div className="cursor" id="cursor" aria-hidden="true" />
      <canvas id="gl" ref={ref} aria-hidden="true" />
      <div className="vig" aria-hidden="true" />
      <div className="scan" aria-hidden="true" />
    </>
  );
}
