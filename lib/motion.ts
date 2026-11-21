import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Wires every scroll/entrance animation on the page.
 * Markup is rendered by the React components; this only animates it.
 * Returns a cleanup function.
 */
export function initMotion(): () => void {
  const root = document.documentElement;
  const loader = document.getElementById("loader");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    if (loader) loader.style.display = "none";
    return () => {};
  }
  root.classList.add("js");

  /* Lenis smooth scroll synced with ScrollTrigger */
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const onAnchor = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute("href")!;
    const el = id.length > 1 ? document.querySelector(id) : null;
    if (el) { e.preventDefault(); lenis?.scrollTo(el as HTMLElement, { duration: 1.4 }); }
  };
  document.addEventListener("click", onAnchor);

  const fg = getComputedStyle(root).getPropertyValue("--fg").trim();
  const ctx = gsap.context(() => {
    /* loader → hero lines slide up */
    const cnt = { v: 0 };
    const n = document.getElementById("ldN");
    gsap.timeline({ onComplete: () => { if (loader) loader.style.display = "none"; } })
      .from(".loader .name span", { yPercent: 110, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power3.out" })
      .to(cnt, { v: 100, duration: 1.2, ease: "power2.inOut", onUpdate: () => { if (n) n.textContent = String(Math.round(cnt.v)).padStart(3, "0"); } }, 0)
      .to(".loader .name span", { yPercent: -110, opacity: 0, stagger: 0.04, duration: 0.5, ease: "power3.in" }, "+=.1")
      .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=.2")
      .from(".hero__title .ln>span", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08 }, "-=.5")
      .from(".hero__foot > *", { y: 20, opacity: 0, stagger: 0.08, duration: 0.7 }, "-=.7");

    /* about: words dim → bright while reading */
    gsap.to("#aboutText .w", { color: fg, stagger: 0.05, ease: "none", scrollTrigger: { trigger: "#aboutText", start: "top 78%", end: "bottom 45%", scrub: true } });

    /* marquee, nudged by scroll velocity */
    const mt = gsap.to("#mq", { xPercent: -50, repeat: -1, duration: 30, ease: "none" });
    ScrollTrigger.create({
      onUpdate: (s) => {
        const v = Math.min(Math.abs(s.getVelocity()) / 600, 4);
        gsap.to(mt, { timeScale: (s.direction < 0 ? -1 : 1) * (1 + v), duration: 0.3, overwrite: true });
        gsap.to(mt, { timeScale: 1, duration: 1.2, delay: 0.3 });
      },
    });

    gsap.utils.toArray<HTMLElement>(".services__list li, .services__head h2, .showreel__head h2").forEach((el) => {
      gsap.from(el, { y: 60, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
    });
    gsap.from("#cta .ln>span", { yPercent: 105, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "#cta", start: "top 85%" } });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      /* showreel grows to full screen while pinned */
      gsap.fromTo("#screen", { scale: 0.45 }, {
        scale: 1, ease: "none",
        scrollTrigger: {
          trigger: "#reel", start: "top top", end: "+=120%", pin: true, scrub: true,
          onUpdate: (s) => {
            const c = document.getElementById("reelN"), b = document.getElementById("reelBar");
            if (c) c.textContent = String(Math.round(s.progress * 100)).padStart(3, "0");
            if (b) b.style.transform = `scaleX(${s.progress})`;
          },
        },
      });

      /* dividers: { WORD } settles while the tagline lights up */
      gsap.utils.toArray<HTMLElement>(".divider").forEach((d) => {
        gsap.timeline({ scrollTrigger: { trigger: d, start: "top top", end: "+=180%", pin: d.querySelector(".divider__sticky") as HTMLElement, scrub: true } })
          .fromTo(d.querySelector(".divider__word"), { scale: 1.6, letterSpacing: "-.02em" }, { scale: 1, letterSpacing: "-.06em", ease: "none" })
          .to(d.querySelectorAll(".divider__tagline .w"), { color: fg, stagger: 0.1, ease: "none" }, "<.2");
      });

      /* case studies */
      gsap.utils.toArray<HTMLElement>(".case").forEach((c) => {
        gsap.fromTo(c.querySelector(".case__media"), { clipPath: "inset(12% 12% 12% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: c, start: "top 85%", end: "top 25%", scrub: true } });
        gsap.from(c.querySelectorAll(".flow .n"), { x: -30, stagger: 0.12, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 55%" } });
        gsap.fromTo(c.querySelector(".idx"), { yPercent: 30 }, { yPercent: -10, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
      });

      /* process cards pin and stack */
      const cards = gsap.utils.toArray<HTMLElement>(".process__card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        ScrollTrigger.create({ trigger: card, start: "top 90px", endTrigger: cards[cards.length - 1], end: "top 90px", pin: true, pinSpacing: false });
        gsap.to(card, { scale: 0.92, opacity: 0.45, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 90px", scrub: true } });
      });
    });
    mm.add("(max-width: 900px)", () => {
      gsap.utils.toArray<HTMLElement>(".divider__tagline").forEach((t) => {
        gsap.to(t.querySelectorAll(".w"), { color: fg, stagger: 0.08, ease: "none", scrollTrigger: { trigger: t, start: "top 85%", end: "bottom 50%", scrub: true } });
      });
    });

    /* custom cursor + magnetic buttons */
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const c = document.getElementById("cursor")!;
      const qx = gsap.quickTo(c, "x", { duration: 0.25, ease: "power3" });
      const qy = gsap.quickTo(c, "y", { duration: 0.25, ease: "power3" });
      window.addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
      document.querySelectorAll("a,button,.services__list li").forEach((el) => {
        el.addEventListener("mouseenter", () => c.classList.add("big"));
        el.addEventListener("mouseleave", () => c.classList.remove("big"));
      });
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((b) => {
        b.addEventListener("mousemove", (e) => {
          const r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 });
        });
        b.addEventListener("mouseleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" }));
      });
    }
  });

  return () => {
    ctx.revert();
    document.removeEventListener("click", onAnchor);
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
    root.classList.remove("js");
  };
}
