"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { createRain } from "@/lib/rain";
import { Roll } from "./Roll";

// Optional: set NEXT_PUBLIC_FORMSPREE_ID in Vercel to receive form messages by email.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function Contact() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rain = useRef<ReturnType<typeof createRain> | null>(null);
  const [note, setNote] = useState<{ text: string; error?: boolean }>({ text: "" });
  const [copied, setCopied] = useState("Copy");
  const [clock, setClock] = useState("Delhi —:—");

  useEffect(() => {
    if (canvas.current) rain.current = createRain(canvas.current);
    const tick = () =>
      setClock("Delhi " + new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => { window.clearInterval(id); rain.current?.destroy(); };
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied("Copied"); }
    catch { setCopied("Select it"); }
    window.setTimeout(() => setCopied("Copy"), 1800);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      setNote({ text: "Add your name and a valid email, then submit again.", error: true });
      return;
    }
    if (!FORMSPREE_ID) {
      setNote({ text: `Thanks ${name}. The form isn't connected yet, so please email me at ${profile.email}.` });
      return;
    }
    setNote({ text: "Sending…" });
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error(String(res.status));
      setNote({ text: `Thanks ${name}, I'll get back to you soon.` });
      form.reset();
    } catch {
      setNote({ text: `That didn't send. Please email me at ${profile.email}.`, error: true });
    }
  };

  return (
    <footer className="footer" id="contact">
      <canvas ref={canvas} aria-hidden="true" />
      <div className="wrap">
        <button className="lt" type="button" onClick={() => rain.current?.drop()}>
          <span className="br">{"{"}</span> Let&apos;s talk <span className="br">{"}"}</span>
          <span className="bolt" aria-hidden="true">⚡</span>
          <span className="u-label">tap to drop my stack</span>
        </button>
        <h2 className="footer__cta" id="cta">
          <span className="ln"><span>Send</span></span>
          <span className="ln"><span className="ou">the</span></span>
          <span className="ln"><span className="ac">request.</span></span>
        </h2>
        <div className="footer__grid">
          <form className="form" onSubmit={submit} noValidate>
            <input id="fName" name="name" placeholder="Name" required autoComplete="name" />
            <input id="fEmail" name="email" type="email" placeholder="Email" required autoComplete="email" />
            <button className="btn" type="submit"><Roll>Submit</Roll></button>
            <p className="form-note" role="status" style={note.error ? { color: "var(--accent)" } : undefined}>{note.text}</p>
          </form>
          <div className="col">
            <p className="u-label">Follow</p>
            <a href={profile.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href={profile.github} target="_blank" rel="noopener">GitHub ↗</a>
            <a href={profile.resume} download={profile.resumeFileName}>Resume ↓</a>
          </div>
          <div className="col">
            <p className="u-label">Write</p>
            <div className="mail">
              <code>{profile.email}</code>
              <button className="copy" type="button" onClick={copy}>{copied}</button>
            </div>
          </div>
        </div>
        <div className="legal">
          <span>© {profile.name}, {new Date().getFullYear()} · All rights reserved</span>
          <span suppressHydrationWarning>{clock}</span>
        </div>
      </div>
    </footer>
  );
}
