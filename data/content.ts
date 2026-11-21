// All site copy lives here. Edit this file to change text, projects or links.

export const profile = {
  name: "Tushar Chauhan",
  role: "Software Engineer II",
  company: "Bosscoder Academy",
  email: "chauhantushar538@gmail.com",
  linkedin: "https://www.linkedin.com/in/tusharchauhantech/",
  github: "https://github.com/Tushar152000",
  resume: "/resume.pdf",
  resumeFileName: "Tushar-Chauhan-Resume.pdf",
  openTo: "Open to SDE II · Full-Stack · Backend · AI Engineer roles",
  credentials: [
    "Software Engineer II",
    "Bosscoder Academy · Feb 2024 →",
    "B.Tech IT · ABES EC · CGPA 8.2",
    "Ghaziabad · Delhi NCR",
  ],
  intro:
    "Full-stack and backend engineer with 2+ years shipping AI-powered SaaS and cloud infrastructure. I led Bosscoder's move from legacy React to Next.js and TypeScript, unified two codebases under one domain with zero downtime, and ship GPT-4o features used by 2,000+ students every month.",
};

export type Stat = { value?: string; label: string };
export const stats: Stat[] = [
  { value: "2+", label: "years shipping" },
  { value: "2,000+", label: "students / month" },
  { value: "60%", label: "faster cold starts" },
  { value: "40+", label: "pages migrated" },
  { label: "Zero-downtime cutover" },
  { value: "500+", label: "LeetCode" },
  { value: "1st", label: "at Project Expo" },
];

export type Service = { title: string; text: string; tags: string[] };
export const services: Service[] = [
  {
    title: "Full-stack products",
    text: "Next.js and React apps on TypeScript with Clean Architecture, shared state that scales across 15+ features, and pages that load fast.",
    tags: ["Next.js", "React", "TypeScript", "Redux", "Recoil", "Tailwind"],
  },
  {
    title: "Backend & queues",
    text: "Node.js and Spring Boot REST services. High-volume work goes through Pub/Sub queues with dead-letter handling, so nothing is lost.",
    tags: ["Node.js", "Spring Boot", "REST", "Pub/Sub", "MySQL", "Firestore"],
  },
  {
    title: "Cloud & DevOps",
    text: "CloudFront and S3 delivery, GCP Cloud Functions, Cloudflare Workers at the edge, and CI/CD on GitHub Actions with zero-downtime cutovers.",
    tags: ["AWS", "GCP", "Cloudflare Workers", "GitHub Actions", "Docker", "Vercel"],
  },
  {
    title: "AI & LLM",
    text: "GPT-4o and Whisper pipelines with prompt chaining: transcription, analysis and generation running inside real products.",
    tags: ["GPT-4o", "Whisper", "LangChain", "Hugging Face", "n8n"],
  },
];

export type FlowNode = { tag: string; text: string; status: string };
export type CaseStudy = {
  window: string;
  meta: string;
  name: string;
  description: string;
  flow: FlowNode[];
  cta: { label: string; href: string; external?: boolean };
};

export const cases: CaseStudy[] = [
  {
    window: "bosscoder · platform",
    meta: "Bosscoder Academy · Feb 2024 — now",
    name: "Platform revamp",
    description:
      "Led the rebuild of a 40+ page site from legacy React to Next.js and TypeScript with Clean Architecture. Unified two codebases under one domain on CloudFront with zero downtime, and I'm now moving hosting from Vercel to AWS (projected 40% lower cost) and building a Cloudflare Workers auth bridge for SSO-style migration.",
    flow: [
      { tag: "BUILD", text: "github actions ci/cd", status: "pass" },
      { tag: "CDN", text: "cloudfront → s3 · one domain", status: "0 downtime" },
      { tag: "APP", text: "next.js + typescript · 40+ pages", status: "200" },
      { tag: "EDGE", text: "cloudflare workers · auth bridge", status: "sso" },
    ],
    cta: { label: "Visit website ↗", href: "https://www.bosscoderacademy.com/", external: true },
  },
  {
    window: "sales-ai · pipeline",
    meta: "AI · Nov 2025 — now",
    name: "Sales call AI",
    description:
      "An end-to-end call-intelligence pipeline: Zoom recordings flow through a Pub/Sub queue with a dead-letter queue into Whisper transcription, then GPT-4o rates each call, flags deal-stage gaps and suggests next steps. Managers review calls 5× faster.",
    flow: [
      { tag: "INGEST", text: "zoom webhook → firebase", status: "201" },
      { tag: "QUEUE", text: "gcp pub/sub · dead-letter queue", status: "0 lost" },
      { tag: "STT", text: "whisper on low-cost gcp", status: "done" },
      { tag: "INSIGHT", text: "gpt-4o · intent · objections · stage", status: "5× faster" },
    ],
    cta: { label: "Ask for a walkthrough", href: "#contact" },
  },
  {
    window: "resume-builder · prod",
    meta: "AI · Mar — May 2025",
    name: "AI Resume Builder",
    description:
      "A SaaS-grade builder that produces an 80+ ATS-score resume in under 7 minutes for 2,000+ students a month. GPT-4o suggestions in every section, Gmail OAuth sessions, and a custom Cloud Function that renders pixel-perfect A4 PDFs. Moving to Gen 2 functions cut cold starts by 60%.",
    flow: [
      { tag: "UI", text: "next.js · typescript · tailwind", status: "200" },
      { tag: "AI", text: "gpt-4o prompt chaining", status: "<7 min" },
      { tag: "FN", text: "gcp gen 2 functions · html → a4 pdf", status: "-60% cold" },
      { tag: "USERS", text: "students every month", status: "2,000+" },
    ],
    cta: { label: "Live demo ↗", href: "https://www.bosscoderacademy.com/free-ats-friendly-resume", external: true },
  },
  {
    window: "nec · attendance",
    meta: "NEC · Nov 2023 — Jan 2024",
    name: "Attendance system",
    description:
      "Capstone of NEC's 10-week backend program: a full attendance management system in Spring Boot, JSP and Thymeleaf tracking 200+ employees in real time, plus 5+ REST API modules across 4 Scrum sprints with no missed deadlines.",
    flow: [
      { tag: "WEB", text: "jsp · thymeleaf", status: "200" },
      { tag: "API", text: "spring boot · 5+ rest modules", status: "up" },
      { tag: "DATA", text: "relational db · 200+ employees", status: "100%" },
    ],
    cta: { label: "See GitHub ↗", href: "https://github.com/Tushar152000", external: true },
  },
  {
    window: "github · Tushar152000",
    meta: "Beyond work",
    name: "Code & contests",
    description:
      "500+ LeetCode and 250+ GeeksforGeeks problems, a 4-star HackerRank rating, 1st place at Project Expo 1.0 and 5+ hackathons. Experiments and smaller builds live on GitHub.",
    flow: [
      { tag: "DSA", text: "leetcode · 100-day badge", status: "500+" },
      { tag: "DSA", text: "geeksforgeeks", status: "250+" },
      { tag: "RANK", text: "hackerrank · dsa · c++ · java", status: "4★" },
      { tag: "WIN", text: "project expo 1.0 · 5+ hackathons", status: "1st" },
    ],
    cta: { label: "Open GitHub ↗", href: "https://github.com/Tushar152000", external: true },
  },
];

export type Step = { name: string; text: string; deliverables: string[] };
export const process: Step[] = [
  {
    name: "Request",
    text: 'Understand the problem before the code: who calls this, how often, and what "done" looks like for them.',
    deliverables: ["Scope agreed with product", "Short design note", "Data model & API contract"],
  },
  {
    name: "Queue",
    text: "Build in small, reviewable slices. Slow work goes async; risky work goes behind a flag.",
    deliverables: ["Typed APIs & components", "Background jobs with retries", "Tests & CI on every push"],
  },
  {
    name: "Response",
    text: "Ship it, watch it in production, and iterate until real usage says it works.",
    deliverables: ["Deploy via GitHub Actions", "Logs & alerts on the new path", "Follow-ups from real data"],
  },
];

export const dividers = {
  work: "Every request leaves a log. These are the ones worth reading.",
  process: "Behind every response there are three stages.",
};

export const palettes = [
  { id: "", label: "Solar amber", swatch: "#ffb547" },
  { id: "ion", label: "Ion cyan", swatch: "#6ef2ff" },
  { id: "violet", label: "Plasma violet", swatch: "#b69cff" },
  { id: "lime", label: "Matrix lime", swatch: "#b4ff39" },
  { id: "crimson", label: "Crimson signal", swatch: "#ff4d6d" },
  { id: "light", label: "Light lab", swatch: "linear-gradient(135deg,#f3f4f1 50%,#2b59ff 50%)" },
];
