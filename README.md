# Tushar Chauhan — Portfolio

**Live:** https://tusharchauhan-dev.vercel.app

A motion-heavy, futuristic developer portfolio built with **Next.js 14 (App Router) + TypeScript**, **GSAP + ScrollTrigger**, **Lenis** smooth scroll and **Three.js**.

Structure follows a classic award-style layout: loader → hero → about → stats marquee → pinned showreel → services → `{ WORK }` → full-screen case studies → `{ PROCESS }` → stacking process cards → contact.

## Features
- 3D field of floating code (tokens + real snippets) behind the page, reacting to cursor and scroll speed
- WebGL particle "system showreel" that scales to full screen while pinned
- Loader, rolling-text links, full-screen menu, sticky mini-nav, magnetic buttons, custom cursor
- Pinned `{ WORK }` / `{ PROCESS }` dividers, full-screen case studies with system-flow diagrams, stacking process cards
- "{ Let's talk }" button that drops the tech stack as physics chips
- 6 colour themes (Solar Amber default, Ion Cyan, Plasma Violet, Matrix Lime, Crimson Signal, Light) — remembered per visitor
- Respects `prefers-reduced-motion`; pinning turns off under 900px

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Edit content
All copy, projects, stats, services and links live in **`data/content.ts`**. The resume is `public/resume.pdf`.

## Contact form
Works without setup (shows a "please email me" message). To receive messages, create a free form at formspree.io and add the env var in Vercel:
```
NEXT_PUBLIC_FORMSPREE_ID=yourFormId
```

## Deploy
Push to GitHub, then import the repo at vercel.com/new — no config needed.

## Project layout
```
app/            layout.tsx (fonts, metadata) · page.tsx · globals.css
components/     Hero, About, Showreel, Services, Divider, CaseStudies, Process, Contact, TopBar, Background, ThemeDock, Loader, MotionProvider, Roll
lib/            motion.ts (GSAP + Lenis) · webgl.ts (code field + terrain) · rain.ts · state.ts
data/           content.ts
public/         resume.pdf
```
