/**
 * "Showreel" film: a looping sequence of animated system-design / AI scenes
 * drawn on a 2D canvas over the particle terrain. Every frame is a pure
 * function of time-since-scene-start, so pausing, seeking and theme changes
 * need no extra state.
 */
import { motionState } from "./state";

export type SceneMeta = { id: string; chapter: string; title: string; sub: string; dur: number };

export const SCENES: SceneMeta[] = [
  { id: "req", chapter: "Request", title: "Request → Response", sub: "Edge cache, load balancer, stateless API pods, Redis in front of Postgres.", dur: 10 },
  { id: "evt", chapter: "Events", title: "Event pipeline", sub: "Webhook → Pub/Sub → workers → Whisper → GPT-4o. Failures park in a DLQ and retry.", dur: 11 },
  { id: "nn", chapter: "Model", title: "Neural network", sub: "Forward pass scores a sales call; backprop nudges the weights.", dur: 10 },
  { id: "rag", chapter: "RAG", title: "Retrieval-augmented LLM", sub: "Embed the question, pull the nearest chunks, let the model answer from them.", dur: 12 },
];

type Pal = { acc: string; accRgb: string; ok: string; err: string; fg: string; mut: string; line: string; panel: string };
type View = { k: number; ox: number; oy: number };
type Node = { id: string; x: number; y: number; w?: number; tag: string; label: string; at: number; kind?: "queue" };
type Flow = {
  every: number; hop: number; start?: number;
  route: (n: number) => string[];
  color: (n: number, hop: number) => string;
};

const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** deterministic 0..1 noise per integer */
const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export type ReelHandle = {
  recolor: () => void;
  seek: (scene: number) => void;
  destroy: () => void;
};

export function createReel(
  canvas: HTMLCanvasElement,
  hooks: { onScene: (i: number) => void; onProgress: (i: number, p: number) => void }
): ReelHandle | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const c = ctx;

  let pal: Pal;
  let mono = "monospace", sans = "sans-serif";
  const recolor = () => {
    const accRgb = css("--acc-rgb") || "255,181,71";
    // the screen is always dark, so text colours are fixed; only the accent follows the theme
    pal = { acc: `rgb(${accRgb})`, accRgb, ok: "#5fd38d", err: "#ff5d6c", fg: "#ece8e1", mut: "#8b8f98", line: "rgba(255,255,255,.13)", panel: "rgba(14,16,22,.92)" };
    mono = css("--mono") || mono;
    sans = css("--font") || sans;
  };
  recolor();

  let W = 0, H = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas);

  /* ---------- drawing helpers ---------- */
  // diagram area: below the title block, above the bottom HUD row
  const view = (vw: number, vh: number): View => {
    const top = H * 0.27, bot = H * 0.88, left = W * 0.04, right = W * 0.96;
    const k = Math.min((right - left) / vw, (bot - top) / vh);
    return { k, ox: left + (right - left - vw * k) / 2, oy: top + (bot - top - vh * k) / 2 };
  };
  const P = (v: View, x: number, y: number): [number, number] => [v.ox + x * v.k, v.oy + y * v.k];
  const fs = (v: View, px: number) => Math.max(8, px * v.k);

  function glowDot(x: number, y: number, r: number, col: string, a = 1) {
    c.save();
    c.globalAlpha *= a;
    c.shadowColor = col; c.shadowBlur = r * 4;
    c.fillStyle = col;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function line(v: View, a: [number, number], b: [number, number], alpha: number, col = pal.line, dash = true) {
    if (alpha <= 0) return;
    c.save();
    c.globalAlpha *= alpha;
    c.strokeStyle = col; c.lineWidth = Math.max(1, v.k);
    if (dash) c.setLineDash([4 * v.k, 4 * v.k]);
    c.beginPath(); c.moveTo(...P(v, a[0], a[1])); c.lineTo(...P(v, b[0], b[1])); c.stroke();
    c.restore();
  }

  function box(v: View, n: Node, t: number, hot = 0) {
    const a = ease((t - n.at) / 0.45);
    if (a <= 0) return;
    const w = (n.w ?? 128) * v.k, h = 54 * v.k;
    const [cx, cy] = P(v, n.x, n.y);
    const x = cx - w / 2, y = cy - h / 2 + (1 - a) * 10 * v.k;
    c.save();
    c.globalAlpha *= a;
    c.fillStyle = pal.panel; c.fillRect(x, y, w, h);
    c.strokeStyle = hot > 0.02 ? `rgba(${pal.accRgb},${0.35 + hot * 0.65})` : pal.line;
    c.lineWidth = Math.max(1, v.k * (1 + hot));
    if (hot > 0.02) { c.shadowColor = pal.acc; c.shadowBlur = 18 * hot * v.k; }
    c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    c.shadowBlur = 0;
    c.textBaseline = "middle";
    c.fillStyle = pal.acc; c.font = `500 ${fs(v, 10.5)}px ${mono}`;
    c.fillText(n.tag, x + 10 * v.k, y + h * 0.32);
    c.fillStyle = pal.fg; c.font = `${fs(v, 12.5)}px ${mono}`;
    c.fillText(n.label, x + 10 * v.k, y + h * 0.68, w - 16 * v.k);
    if (n.kind === "queue") {
      // backlog meter on the right edge of the box
      for (let i = 0; i < 5; i++) {
        const on = i < 2 + Math.round((Math.sin(t * 2.1) + 1) * 1.5);
        c.fillStyle = on ? `rgba(${pal.accRgb},.8)` : "rgba(255,255,255,.08)";
        c.fillRect(x + w - 14 * v.k, y + h - (10 + i * 8) * v.k, 6 * v.k, 5 * v.k);
      }
    }
    c.restore();
  }

  /** Runs every flow: returns per-node flash (0..1) and a list of packets to draw last. */
  function flows(nodes: Record<string, Node>, fl: Flow[], t: number) {
    const hot: Record<string, number> = {};
    const dots: { x: number; y: number; col: string }[] = [];
    for (const f of fl) {
      const t0 = t - (f.start ?? 1.2);
      if (t0 < 0) continue;
      const last = Math.floor(t0 / f.every);
      for (let n = Math.max(0, last - 12); n <= last; n++) {
        const s = t0 - n * f.every;
        const r = f.route(n);
        const hops = r.length - 1;
        if (s > hops * f.hop + 0.4) continue;
        for (let j = 1; j <= hops; j++) {
          const since = s - j * f.hop;
          if (since >= 0) hot[r[j]] = Math.max(hot[r[j]] ?? 0, Math.exp(-since * 5));
        }
        if (s >= hops * f.hop) continue;
        const h = Math.floor(s / f.hop), u = ease((s % f.hop) / f.hop);
        const A = nodes[r[h]], B = nodes[r[h + 1]];
        dots.push({ x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, col: f.color(n, h) });
      }
    }
    return { hot, dots };
  }

  function graph(v: View, nodes: Record<string, Node>, edges: [string, string][], fl: Flow[], t: number) {
    const { hot, dots } = flows(nodes, fl, t);
    for (const [a, b] of edges) {
      const A = nodes[a], B = nodes[b];
      line(v, [A.x, A.y], [B.x, B.y], ease((t - Math.max(A.at, B.at) - 0.2) / 0.5));
    }
    for (const n of Object.values(nodes)) box(v, n, t, hot[n.id] ?? 0);
    for (const d of dots) { const [x, y] = P(v, d.x, d.y); glowDot(x, y, Math.max(2.2, 4 * v.k), d.col); }
  }

  const nodeMap = (list: Node[]) => Object.fromEntries(list.map((n) => [n.id, n]));

  /* ---------- scene 1: request → response ---------- */
  const s1 = nodeMap([
    { id: "client", x: 70, y: 200, w: 120, tag: "CLIENT", label: "browser", at: 0.2 },
    { id: "cdn", x: 240, y: 200, w: 130, tag: "CDN", label: "edge cache", at: 0.4 },
    { id: "lb", x: 410, y: 200, w: 130, tag: "LB", label: "round-robin", at: 0.6 },
    { id: "a0", x: 590, y: 90, w: 128, tag: "API", label: "pod 1", at: 0.8 },
    { id: "a1", x: 590, y: 200, w: 128, tag: "API", label: "pod 2", at: 0.9 },
    { id: "a2", x: 590, y: 310, w: 128, tag: "API", label: "pod 3", at: 1.0 },
    { id: "cache", x: 800, y: 120, w: 140, tag: "CACHE", label: "redis", at: 1.1 },
    { id: "db", x: 800, y: 290, w: 140, tag: "DB", label: "postgres", at: 1.2 },
  ]);
  const s1e: [string, string][] = [["client", "cdn"], ["cdn", "lb"], ["lb", "a0"], ["lb", "a1"], ["lb", "a2"],
    ["a0", "cache"], ["a1", "cache"], ["a2", "cache"], ["a0", "db"], ["a1", "db"], ["a2", "db"]];
  const s1route = (n: number) => {
    const r = rnd(n);
    if (r < 0.22) return ["client", "cdn", "client"]; // static asset served at the edge
    const api = `a${n % 3}`;
    const store = r < 0.75 ? "cache" : "db";
    return ["client", "cdn", "lb", api, store, api, "lb", "cdn", "client"];
  };
  const s1f: Flow[] = [{
    every: 0.42, hop: 0.32, route: s1route,
    color: (n, h) => {
      const r = s1route(n);
      if (r.length === 3) return h === 0 ? pal.acc : pal.ok;
      return h < 4 ? pal.acc : r[4] === "db" ? "#ffd27a" : pal.ok;
    },
  }];
  function scene1(t: number) {
    const v = view(900, 400);
    graph(v, s1, s1e, s1f, t);
    legend(v, t, [[pal.acc, "request"], [pal.ok, "cache / edge hit"], ["#ffd27a", "db read"]]);
  }

  /* ---------- scene 2: event pipeline ---------- */
  const s2 = nodeMap([
    { id: "hook", x: 70, y: 180, w: 120, tag: "WEBHOOK", label: "zoom", at: 0.2 },
    { id: "api", x: 225, y: 180, w: 120, tag: "INGEST", label: "202 accepted", at: 0.4 },
    { id: "topic", x: 390, y: 180, w: 136, tag: "PUB/SUB", label: "topic: calls", at: 0.6, kind: "queue" },
    { id: "w0", x: 560, y: 80, w: 116, tag: "WORKER", label: "#1", at: 0.8 },
    { id: "w1", x: 560, y: 180, w: 116, tag: "WORKER", label: "#2", at: 0.9 },
    { id: "w2", x: 560, y: 280, w: 116, tag: "WORKER", label: "#3", at: 1.0 },
    { id: "stt", x: 725, y: 180, w: 124, tag: "STT", label: "whisper", at: 1.1 },
    { id: "llm", x: 880, y: 180, w: 124, tag: "LLM", label: "gpt-4o", at: 1.2 },
    { id: "store", x: 1030, y: 180, w: 128, tag: "STORE", label: "insights", at: 1.3 },
    { id: "dlq", x: 390, y: 330, w: 136, tag: "DLQ", label: "dead-letter", at: 1.4 },
  ]);
  const s2e: [string, string][] = [["hook", "api"], ["api", "topic"], ["topic", "w0"], ["topic", "w1"], ["topic", "w2"],
    ["w0", "stt"], ["w1", "stt"], ["w2", "stt"], ["stt", "llm"], ["llm", "store"], ["w2", "dlq"], ["dlq", "topic"]];
  const s2route = (n: number) => {
    const w = `w${n % 3}`;
    if (n % 7 === 3) return ["hook", "api", "topic", "w2", "dlq", "topic", "w0", "stt", "llm", "store"];
    return ["hook", "api", "topic", w, "stt", "llm", "store"];
  };
  const s2f: Flow[] = [{
    every: 0.55, hop: 0.36, route: s2route,
    color: (n, h) => {
      const r = s2route(n);
      if (r.length > 7) { if (h === 3) return pal.err; if (h === 4) return "#ffd27a"; }
      return r[h + 1] === "store" ? pal.ok : pal.acc;
    },
  }];
  function scene2(t: number) {
    const v = view(1100, 400);
    graph(v, s2, s2e, s2f, t);
    legend(v, t, [[pal.acc, "event"], [pal.err, "worker failed"], ["#ffd27a", "retry from DLQ"], [pal.ok, "insight saved"]]);
  }

  /* ---------- scene 3: neural network ---------- */
  const layers = [4, 6, 6, 3];
  const inLabels = ["talk ratio", "objections", "pricing asked", "next step set"];
  const outLabels = ["won", "stalled", "lost"];
  function scene3(t: number) {
    const v = view(1000, 400);
    const LX = [200, 430, 640, 830];
    const pos = layers.map((cnt, L) => Array.from({ length: cnt }, (_, i) => [LX[L], 200 + (i - (cnt - 1) / 2) * (cnt > 4 ? 58 : 80)] as [number, number]));
    const cyc = 2.6;
    const pass = Math.floor(Math.max(0, t - 1) / cyc);
    const ph = (Math.max(0, t - 1) % cyc) / cyc; // 0..1 within a pass
    const back = pass % 3 === 2;
    const front = back ? 1 - ph : ph; // wave position across the layers (0..1)
    const appear = (L: number) => ease((t - 0.2 - L * 0.25) / 0.5);

    // edges
    for (let L = 0; L < layers.length - 1; L++) {
      const a = Math.min(appear(L), appear(L + 1));
      pos[L].forEach((p, i) => pos[L + 1].forEach((q, j) => {
        const w = rnd(L * 100 + i * 10 + j) * 2 - 1;
        const mid = (L + 0.5) / (layers.length - 1);
        const lit = t > 1 ? Math.exp(-Math.pow((front - mid) * 7, 2)) : 0;
        const col = back ? pal.err : w > 0 ? pal.acc : "#7fb2ff";
        line(v, p, q, a * (0.18 + Math.abs(w) * 0.25), pal.line, false);
        if (lit > 0.05) line(v, p, q, a * lit * Math.abs(w), col, false);
      }));
    }
    // nodes
    pos.forEach((col, L) => col.forEach((p, i) => {
      const act = rnd(pass * 37 + L * 11 + i);
      const reached = t > 1 && (back ? front <= L / (layers.length - 1) + 0.05 : front >= L / (layers.length - 1) - 0.05);
      const [x, y] = P(v, p[0], p[1]);
      c.save(); c.globalAlpha *= appear(L);
      c.fillStyle = pal.panel; c.strokeStyle = pal.line; c.lineWidth = Math.max(1, v.k);
      c.beginPath(); c.arc(x, y, 13 * v.k, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
      if (reached) glowDot(x, y, (4 + act * 6) * v.k, back ? pal.err : pal.acc, appear(L) * (0.35 + act * 0.65));
    }));
    // labels
    c.save(); c.textBaseline = "middle"; c.font = `${fs(v, 12)}px ${mono}`;
    pos[0].forEach((p, i) => {
      const [x, y] = P(v, p[0] - 26, p[1]);
      c.globalAlpha = appear(0); c.fillStyle = pal.mut; c.textAlign = "right"; c.fillText(inLabels[i], x, y);
    });
    // output probabilities
    const probs = [rnd(pass * 5 + 1), rnd(pass * 5 + 2), rnd(pass * 5 + 3)].map((p) => 0.2 + p);
    const sum = probs.reduce((a, b) => a + b, 0);
    const best = probs.indexOf(Math.max(...probs));
    const shown = !back && t > 1 && front > 0.92;
    pos[3].forEach((p, i) => {
      const [x, y] = P(v, p[0] + 26, p[1]);
      const pr = probs[i] / sum;
      c.globalAlpha = appear(3); c.textAlign = "left";
      c.fillStyle = i === best && shown ? pal.fg : pal.mut;
      c.fillText(outLabels[i], x, y - 9 * v.k);
      c.fillStyle = "rgba(255,255,255,.08)"; c.fillRect(x, y + 3 * v.k, 90 * v.k, 5 * v.k);
      c.fillStyle = i === best ? pal.acc : `rgba(${pal.accRgb},.45)`;
      c.fillRect(x, y + 3 * v.k, 90 * v.k * pr * (shown ? 1 : 0.15), 5 * v.k);
    });
    // phase label + loss curve
    c.globalAlpha = clamp((t - 1) / 0.5); c.textAlign = "left";
    const [lx, ly] = P(v, 40, 20);
    c.fillStyle = back ? pal.err : pal.acc; c.font = `500 ${fs(v, 11)}px ${mono}`;
    c.fillText(back ? "BACKPROP · ∂loss/∂w" : "FORWARD PASS · inference", lx, ly);
    const [gx, gy] = P(v, 856, 372), gw = 120 * v.k, gh = 34 * v.k;
    c.strokeStyle = "rgba(255,255,255,.1)"; c.lineWidth = 1; c.strokeRect(gx, gy - gh, gw, gh);
    c.strokeStyle = pal.ok; c.lineWidth = Math.max(1, 1.4 * v.k); c.beginPath();
    const prog = clamp((t - 1) / 8);
    for (let i = 0; i <= 40 * prog; i++) {
      const u = i / 40, l = Math.exp(-u * 3.2) * 0.85 + 0.08 + rnd(i) * 0.05;
      const px = gx + u * gw, py = gy - l * gh;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.stroke();
    c.fillStyle = pal.mut; c.font = `${fs(v, 10)}px ${mono}`; c.fillText("training loss", gx, gy + 12 * v.k);
    c.restore();
  }

  /* ---------- scene 4: RAG ---------- */
  const question = "Why did the Acme deal stall?";
  const answer = "Pricing objection raised twice and no next step was booked. Suggest a follow-up with a revised quote.";
  const cloud = Array.from({ length: 70 }, (_, i) => {
    const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 99)) * 92;
    return [500 + Math.cos(a) * r * 1.25, 175 + Math.sin(a) * r] as [number, number];
  });
  const qPt: [number, number] = [528, 160];
  const topK = cloud.map((p, i) => [Math.hypot(p[0] - qPt[0], p[1] - qPt[1]), i]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((d) => d[1]);
  function scene4(t: number) {
    const v = view(1100, 400);
    const nodes = nodeMap([
      { id: "q", x: 95, y: 175, w: 170, tag: "QUESTION", label: question.slice(0, Math.floor(clamp((t - 0.3) / 1.2) * question.length)), at: 0.1 },
      { id: "emb", x: 285, y: 175, w: 130, tag: "EMBED", label: "1536-d vector", at: 1.2 },
      { id: "vdb", x: 500, y: 175, w: 0, tag: "", label: "", at: 99 },
      { id: "ctx", x: 735, y: 175, w: 140, tag: "CONTEXT", label: "top-3 chunks", at: 4.4 },
      { id: "llm", x: 920, y: 175, w: 130, tag: "LLM", label: "gpt-4o", at: 5.6 },
    ]);
    line(v, [nodes.q.x, 175], [nodes.emb.x, 175], ease((t - 1.3) / 0.4));
    line(v, [nodes.emb.x, 175], [395, 175], ease((t - 2.2) / 0.4));
    line(v, [612, 175], [nodes.ctx.x, 175], ease((t - 4.3) / 0.4));
    line(v, [nodes.ctx.x, 175], [nodes.llm.x, 175], ease((t - 5.5) / 0.4));
    // packets along the chain
    const hop = (a: number, b: number, t0: number, d: number, col = pal.acc) => {
      const u = (t - t0) / d;
      if (u < 0 || u > 1) return;
      const [x, y] = P(v, a + (b - a) * ease(u), 175);
      glowDot(x, y, Math.max(2.2, 4 * v.k), col);
    };
    hop(nodes.q.x, nodes.emb.x, 1.5, 0.5);
    hop(nodes.emb.x, 420, 2.3, 0.6);
    [0, 0.15, 0.3].forEach((d) => hop(600, nodes.ctx.x, 4.2 + d, 0.6, pal.ok));
    hop(nodes.ctx.x, nodes.llm.x, 5.6, 0.5);

    // vector store: point cloud, query lands, nearest neighbours light up
    const ca = ease((t - 2) / 0.6);
    c.save(); c.globalAlpha *= ca;
    const [vx, vy] = P(v, 500, 175);
    c.strokeStyle = pal.line; c.lineWidth = 1; c.setLineDash([3, 4]);
    c.beginPath(); c.ellipse(vx, vy, 125 * v.k, 102 * v.k, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.fillStyle = pal.acc; c.font = `500 ${fs(v, 10.5)}px ${mono}`; c.textAlign = "center";
    c.fillText("VECTOR DB · cosine search", vx, vy + 122 * v.k);
    const found = clamp((t - 3.2) / 0.8);
    cloud.forEach((p, i) => {
      const [x, y] = P(v, p[0], p[1]);
      const k = topK.indexOf(i);
      const hit = k >= 0 && found > k / 3;
      const tw = 0.4 + 0.3 * Math.sin(t * 2 + i);
      hit ? glowDot(x, y, 3.6 * v.k, pal.ok) : (c.fillStyle = `rgba(255,255,255,${0.12 + tw * 0.2})`, c.fillRect(x - 1.2, y - 1.2, 2.4, 2.4));
    });
    if (t > 2.9) {
      const [qx, qy] = P(v, qPt[0], qPt[1]);
      // scan ring
      const ring = ((t - 2.9) % 1.4) / 1.4;
      if (t < 4.4) { c.strokeStyle = `rgba(${pal.accRgb},${1 - ring})`; c.beginPath(); c.arc(qx, qy, ring * 50 * v.k, 0, Math.PI * 2); c.stroke(); }
      topK.forEach((i, k) => {
        if (found <= k / 3) return;
        const [x, y] = P(v, cloud[i][0], cloud[i][1]);
        c.strokeStyle = `rgba(95,211,141,.7)`; c.beginPath(); c.moveTo(qx, qy); c.lineTo(x, y); c.stroke();
      });
      glowDot(qx, qy, 5 * v.k, pal.acc);
    }
    c.restore();

    for (const id of ["q", "emb", "ctx", "llm"]) {
      const hot = id === "emb" ? Math.exp(-Math.max(0, t - 2) * 3) * (t > 2 ? 1 : 0)
        : id === "llm" ? (t > 6.1 && t < 10.5 ? 0.5 + 0.5 * Math.sin(t * 8) : 0)
        : id === "ctx" ? Math.exp(-Math.max(0, t - 4.8) * 3) * (t > 4.8 ? 1 : 0) : 0;
      box(v, nodes[id], t, hot);
    }
    // embedding bars under the EMBED box
    if (t > 1.9) {
      const [bx, by] = P(v, nodes.emb.x - 55, 222);
      for (let i = 0; i < 22; i++) {
        const h = (0.2 + rnd(i) * 0.8) * 22 * v.k * ease((t - 1.9 - i * 0.02) / 0.4);
        c.fillStyle = `rgba(${pal.accRgb},${0.35 + rnd(i + 5) * 0.5})`;
        c.fillRect(bx + i * 5 * v.k, by + 22 * v.k - h, 3 * v.k, h);
      }
    }
    // streamed answer
    if (t > 6.2) {
      const words = answer.split(" ");
      const nW = Math.floor(clamp((t - 6.2) / 3.8) * words.length);
      const [ax, ay] = P(v, 680, 265);
      const maxW = 400 * v.k;
      c.save();
      c.fillStyle = pal.mut; c.font = `500 ${fs(v, 10.5)}px ${mono}`; c.textBaseline = "top";
      c.fillStyle = pal.acc; c.fillText("ANSWER · streaming", ax, ay);
      c.fillStyle = pal.fg; c.font = `${fs(v, 13.5)}px ${sans}`;
      let lineStr = "", yy = ay + 20 * v.k;
      const lh = fs(v, 13.5) * 1.35;
      words.slice(0, nW).forEach((w) => {
        const test = lineStr ? `${lineStr} ${w}` : w;
        if (c.measureText(test).width > maxW) { c.fillText(lineStr, ax, yy); yy += lh; lineStr = w; } else lineStr = test;
      });
      const caret = Math.sin(t * 10) > 0 && nW < words.length ? " ▍" : "";
      c.fillText(lineStr + caret, ax, yy);
      c.restore();
    }
  }

  function legend(v: View, t: number, items: [string, string][]) {
    const a = ease((t - 1.6) / 0.6);
    if (a <= 0) return;
    c.save(); c.globalAlpha *= a;
    c.font = `${fs(v, 11)}px ${mono}`; c.textBaseline = "middle";
    let [x, y] = P(v, 0, 392);
    for (const [col, label] of items) {
      glowDot(x + 4, y, 3, col);
      c.fillStyle = pal.mut; c.fillText(label, x + 14, y);
      x += c.measureText(label).width + 40;
    }
    c.restore();
  }

  const draw = [scene1, scene2, scene3, scene4];

  /* ---------- playback ---------- */
  let scene = 0, t = 0, last = performance.now(), raf = 0, visible = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) t = 7;
  const io = new IntersectionObserver((es) => (visible = es[0].isIntersecting));
  io.observe(canvas);

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (motionState.on && visible) {
      t += dt;
      if (t >= SCENES[scene].dur) { t = 0; scene = (scene + 1) % SCENES.length; hooks.onScene(scene); }
    }
    if (visible && W > 0) {
      const D = SCENES[scene].dur;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      // slow push-in + crossfade, like a camera move between shots
      const zoom = 0.97 + 0.03 * ease(t / D);
      c.globalAlpha = clamp(Math.min(t / 0.5, (D - t) / 0.5));
      c.translate(W / 2, H * 0.6); c.scale(zoom, zoom); c.translate(-W / 2, -H * 0.6);
      draw[scene](t);
      c.globalAlpha = 1;
      hooks.onProgress(scene, t / D);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  hooks.onScene(0);

  return {
    recolor,
    seek(i: number) { scene = i; t = motionState.on ? 0 : SCENES[i].dur * 0.7; hooks.onScene(i); },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); },
  };
}
