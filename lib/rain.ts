// "{ Let's talk }" interaction: the tech stack falls in as chips with simple box physics.
const WORDS = ["TypeScript", "Next.js", "React", "Node.js", "Spring Boot", "Java", "Python", "MySQL", "Firestore", "Redux", "Recoil", "Tailwind", "Docker", "AWS", "CloudFront", "S3", "GCP", "Pub/Sub", "Workers", "GH Actions", "GPT-4o", "Whisper", "LangChain", "REST", "Vercel", "n8n"];

type Chip = { t: string; x: number; y: number; w: number; h: number; vx: number; vy: number; a: number; va: number; hl: boolean };

export function createRain(canvas: HTMLCanvasElement) {
  const host = canvas.parentElement as HTMLElement;
  const ctx = canvas.getContext("2d")!;
  const font = () => `600 14px ${getComputedStyle(document.body).getPropertyValue("--font") || "sans-serif"}`;
  let W = 0, H = 0, wi = 0, running = false, raf = 0;
  const chips: Chip[] = [];
  let fg = "", acc = "", pan = "", line = "", bg = "";

  function colors() {
    const cs = getComputedStyle(document.documentElement);
    fg = cs.getPropertyValue("--fg").trim();
    acc = cs.getPropertyValue("--accent").trim();
    pan = cs.getPropertyValue("--bg-2").trim();
    line = cs.getPropertyValue("--line-hi").trim();
    bg = cs.getPropertyValue("--bg").trim();
  }
  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    canvas.width = W * d; canvas.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function add() {
    const t = WORDS[wi++ % WORDS.length];
    ctx.font = font();
    const w = ctx.measureText(t).width + 30;
    chips.push({ t, x: Math.random() * (W - w) + w / 2, y: -30 - Math.random() * 300, w, h: 34, vx: (Math.random() - 0.5) * 2, vy: 0, a: (Math.random() - 0.5) * 0.6, va: (Math.random() - 0.5) * 0.05, hl: Math.random() < 0.22 });
    if (chips.length > 70) chips.shift();
  }
  function step() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < chips.length; i++) {
      const o = chips[i];
      o.vy += 0.42; o.x += o.vx; o.y += o.vy; o.a += o.va;
      const floor = H - o.h / 2 - 8;
      if (o.y > floor) { o.y = floor; o.vy *= -0.32; o.vx *= 0.85; o.va *= 0.5; o.a *= 0.85; if (Math.abs(o.vy) < 0.6) o.vy = 0; }
      if (o.x < o.w / 2) { o.x = o.w / 2; o.vx *= -0.5; }
      if (o.x > W - o.w / 2) { o.x = W - o.w / 2; o.vx *= -0.5; }
      for (let j = 0; j < chips.length; j++) {
        if (i === j) continue;
        const q = chips[j], dx = o.x - q.x, dy = o.y - q.y;
        const ox = (o.w + q.w) / 2 - Math.abs(dx), oy = (o.h + q.h) / 2 - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (oy < ox) { const s = dy < 0 ? -1 : 1; o.y += s * oy * 0.5; q.y -= s * oy * 0.5; if (s < 0) { o.vy = Math.min(o.vy, 0) * 0.3; o.va *= 0.5; } }
          else { const s = dx < 0 ? -1 : 1; o.x += s * ox * 0.5; q.x -= s * ox * 0.5; o.vx *= -0.3; }
        }
      }
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a);
      ctx.fillStyle = o.hl ? acc : pan; ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
      ctx.strokeStyle = line; ctx.strokeRect(-o.w / 2 + 0.5, -o.h / 2 + 0.5, o.w - 1, o.h - 1);
      ctx.fillStyle = o.hl ? bg : fg; ctx.font = font(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(o.t, 0, 1); ctx.restore();
    }
    raf = requestAnimationFrame(step);
  }

  size(); colors();
  window.addEventListener("resize", size);
  return {
    drop(n = 14) {
      colors();
      for (let k = 0; k < n; k++) add();
      if (!running) { running = true; step(); }
    },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", size); },
  };
}
