"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { getLenis } from "@/lib/motion";
import { Roll } from "./Roll";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
];

/** Logo + hamburger over the hero; becomes the sticky mini-nav once you scroll past it. */
export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const past = y > window.innerHeight * 0.8;
      setSolid(past);
      if (!past || y < lastY.current - 4) setHidden(false);
      else if (y > lastY.current + 4) setHidden(true);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const lenis = getLenis();
    if (open) lenis?.stop(); else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className={`bar${solid ? " is-solid" : ""}${hidden && !open ? " is-hidden" : ""}`}>
        <div className="wrap">
          <a href="#top" className="logo">Tushar<em>.</em></a>
          <nav aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}><Roll>{l.label}</Roll></a>
            ))}
          </nav>
          <div className="right">
            <a href="#contact" className="btn magnetic"><Roll>Let&apos;s talk</Roll></a>
            <button
              className="burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="tile"
              onClick={() => setOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>
      <div className="tile" id="tile" aria-hidden={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} className="mlink" onClick={() => setOpen(false)}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <Roll>{l.label}</Roll>
              </a>
            </li>
          ))}
        </ul>
        <div className="meta u-label">
          <div>
            <a href={profile.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href={profile.github} target="_blank" rel="noopener">GitHub ↗</a>
            <a href={profile.resume} download={profile.resumeFileName} data-resume>Resume ↓</a>
          </div>
          <span>{profile.email}</span>
        </div>
      </div>
    </>
  );
}
