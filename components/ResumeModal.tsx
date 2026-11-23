"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { getLenis } from "@/lib/motion";

/**
 * Resume preview. Any link with `data-resume` opens this instead of downloading
 * straight away; the link keeps its `download` attribute as a no-JS fallback.
 */
export default function ResumeModal() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-resume]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      lastFocus.current = a;
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.body.classList.add("resume-open");
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("resume-open");
      if (!document.body.classList.contains("menu-open")) lenis?.start();
      lastFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="rmodal" role="dialog" aria-modal="true" aria-labelledby="rmodal-title" onClick={() => setOpen(false)}>
      <div className="rmodal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="rmodal__head">
          <div>
            <p className="u-label">Resume · preview</p>
            <h2 id="rmodal-title" className="rmodal__title">{profile.name}</h2>
          </div>
          <div className="rmodal__actions">
            <a href={profile.resume} target="_blank" rel="noopener" className="btn btn--ghost">Open ↗</a>
            <a href={profile.resume} download={profile.resumeFileName} className="btn">Download ↓</a>
            <button ref={closeRef} type="button" className="rmodal__close" aria-label="Close preview" onClick={() => setOpen(false)}>✕</button>
          </div>
        </header>
        <div className="rmodal__body">
          <iframe src={`${profile.resume}#view=FitH&toolbar=0`} title={`${profile.name} resume preview`} />
          <p className="rmodal__fallback u-label">
            Preview not showing on this device? <a href={profile.resume} target="_blank" rel="noopener">Open the PDF ↗</a>
          </p>
        </div>
      </div>
    </div>
  );
}
