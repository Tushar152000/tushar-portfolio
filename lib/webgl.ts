import * as THREE from "three";
import { motionState } from "./state";

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export type FieldHandle = { recolor: () => void; destroy: () => void };

/* ---------- Code field: floating tokens + real snippets flying toward the viewer ---------- */
export function createCodeField(canvas: HTMLCanvasElement): FieldHandle | null {
  let r: THREE.WebGLRenderer;
  try {
    r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  const mono = getComputedStyle(document.body).getPropertyValue("--mono") || "monospace";

  function textTex(lines: string[], px: number) {
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    g.font = `500 ${px}px ${mono}`;
    let w = 0;
    lines.forEach((l) => (w = Math.max(w, g.measureText(l).width)));
    const lh = px * 1.45;
    c.width = Math.ceil(w + px);
    c.height = Math.ceil(lh * lines.length + px * 0.6);
    g.font = `500 ${px}px ${mono}`;
    g.fillStyle = "#fff";
    g.textBaseline = "top";
    lines.forEach((l, i) => g.fillText(l, px * 0.5, px * 0.3 + i * lh));
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return { tex: t, aspect: c.width / c.height };
  }

  const TOKENS = ["{ }", "</>", "=>", "( )", "[ ]", ";", "&&", "??", "//", "async", "await", "const", "return", "import", "?.", "...", "===", "fn()", "λ", "0x1F", "git push", "npm run dev", "SELECT *", "200 OK", "<App />", "pubsub.publish()", "await llm()", "res.json()", "POST /api", "export default", "useEffect", "@RestController", "try { }", "whisper()", "docker up", "cloudfront", "</div>", "interface", "type T = {}", "new Worker()"];
  const SNIPPETS = [
    ['app.post("/zoom/webhook", async (req, res) => {', '  await pubsub.topic("calls").publishMessage({ json: req.body });', "  res.sendStatus(202);", "});"],
    ["const res = await openai.chat", "  .completions.create({", '    model: "gpt-4o",', "    messages,", "  });"],
    ["export default async function", "Page({ params }) {", "  const data = await getCourse(params.id);", "  return <Course data={data} />;", "}"],
    ["const text = await whisper.transcribe(audio);", "const insight = await gpt4o.analyse(text);", "await db.calls.doc(id).set({ insight });"],
    ["SELECT id, title FROM courses", "WHERE published = true", "ORDER BY created_at DESC;"],
    ['$ git commit -m "feat: ship it"', "$ git push origin main", "✓ deployed to production"],
  ];

  type Item = { s: THREE.Sprite; m: THREE.SpriteMaterial; kind: "tok" | "snip"; lit: boolean; ok: boolean; speed: number; base: number; ph: number };
  const small = window.innerWidth < 700;
  const N = small ? 60 : 130;
  const items: Item[] = [];
  const NEAR = 4, FAR = -90;
  const tokTex = TOKENS.map((t) => textTex([t], 64));
  const snipTex = SNIPPETS.map((s) => textTex(s, 40));

  function place(it: Item, fresh: boolean) {
    it.s.position.set((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 40, fresh ? FAR + Math.random() * (NEAR - FAR) : FAR - Math.random() * 10);
    it.ph = Math.random() * 6.28;
  }
  function make(info: { tex: THREE.Texture; aspect: number }, h: number, kind: "tok" | "snip") {
    const m = new THREE.SpriteMaterial({ map: info.tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const roll = Math.random();
    const lit = kind !== "snip" && roll < 0.28;
    const ok = kind !== "snip" && !lit && roll < 0.34;
    const s = new THREE.Sprite(m);
    s.scale.set(h * info.aspect, h, 1);
    scene.add(s);
    const it: Item = { s, m, kind, lit, ok, speed: kind === "snip" ? 0.045 + Math.random() * 0.03 : 0.06 + Math.random() * 0.09, base: kind === "snip" ? 0.35 : lit ? 0.6 : 0.45, ph: 0 };
    place(it, true);
    items.push(it);
  }
  for (let i = 0; i < N; i++) make(tokTex[i % tokTex.length], 0.9 + Math.random() * 1.1, "tok");
  for (let j = 0; j < (small ? 3 : SNIPPETS.length); j++) make(snipTex[j], 4.2, "snip");

  function recolor() {
    const A = new THREE.Color(css("--accent")), M = new THREE.Color(css("--muted")), O = new THREE.Color(css("--ok"));
    const light = document.documentElement.dataset.palette === "light";
    items.forEach((it) => {
      it.m.color.copy(it.lit ? A : it.ok ? O : M);
      it.m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      it.m.needsUpdate = true;
    });
  }
  recolor();

  let mx = 0, my = 0, vel = 0, lastY = window.scrollY, last = performance.now(), t = 0, raf = 0;
  const onMove = (e: PointerEvent) => { mx = (e.clientX / window.innerWidth) * 2 - 1; my = (e.clientY / window.innerHeight) * 2 - 1; };
  const onScroll = () => { vel += Math.abs(window.scrollY - lastY) * 0.02; lastY = window.scrollY; };
  const size = () => { r.setSize(window.innerWidth, window.innerHeight, false); cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", size);
  size();

  function loop(now: number) {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    vel *= 0.92;
    const boost = 1 + Math.min(vel, 6);
    if (motionState.on) t += dt;
    items.forEach((it) => {
      if (motionState.on) {
        it.s.position.z += it.speed * dt * boost;
        it.s.position.x += Math.sin(t * 0.01 + it.ph) * 0.004 * dt;
        it.s.position.y += Math.cos(t * 0.012 + it.ph) * 0.004 * dt;
      }
      if (it.s.position.z > NEAR) place(it, false);
      const z = it.s.position.z;
      it.m.opacity = Math.max(0, Math.min(Math.min(1, (z - FAR) / 25), Math.min(1, (NEAR - z) / 35))) * it.base; // fade out well before reaching the camera so nothing gets huge
    });
    cam.position.x += (mx * 3 - cam.position.x) * 0.04;
    cam.position.y += (-my * 2 - cam.position.y) * 0.04;
    cam.lookAt(0, 0, -40);
    r.render(scene, cam);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    recolor,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", size);
      r.dispose();
    },
  };
}

/* ---------- Particle terrain (showreel screen) ---------- */
export function createTerrain(canvas: HTMLCanvasElement, opts: { camY?: number; amp?: number } = {}): FieldHandle | null {
  let r: THREE.WebGLRenderer;
  try {
    r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null;
  }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  cam.position.set(0, opts.camY ?? 5.5, 14);
  cam.lookAt(0, 0, -14);
  const small = window.innerWidth < 700;
  const cols = small ? 110 : 200, rows = small ? 70 : 120;
  const pos = new Float32Array(cols * rows * 3);
  let k = 0;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { pos[k++] = (i / (cols - 1) - 0.5) * 80; pos[k++] = 0; pos[k++] = -(j / (rows - 1)) * 70 + 10; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const u = {
    uHi: { value: new THREE.Color(css("--accent")) },
    uT: { value: 0 },
    uM: { value: new THREE.Vector2() },
    uA: { value: opts.amp ?? 1 },
    uPR: { value: r.getPixelRatio() },
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uT;uniform vec2 uM;uniform float uA;uniform float uPR;varying float vH;varying float vD;
void main(){vec3 p=position;float w=(sin(p.x*.18+uT*.9)*.9+cos(p.z*.22-uT*.7)*.8+sin((p.x+p.z)*.08+uT*.4)*1.2)*uA;
vec2 mm=vec2(uM.x*26.,-uM.y*18.-12.);float d=distance(p.xz,mm);w+=sin(d*.9-uT*4.)*exp(-d*.12)*1.6;
p.y=w;vH=w;vec4 mv=modelViewMatrix*vec4(p,1.);vD=-mv.z;
gl_PointSize=uPR*(2.6+(w+2.)*.6)*(16./vD);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform vec3 uHi;varying float vH;varying float vD;
void main(){vec2 c=gl_PointCoord-.5;float rr=length(c);if(rr>.5)discard;float a=smoothstep(.5,0.,rr);
vec3 col=mix(uHi*.18,uHi,smoothstep(-1.5,2.2,vH));float fog=smoothstep(70.,8.,vD);gl_FragColor=vec4(col,a*fog*.85);}`,
  });
  scene.add(new THREE.Points(g, m));

  let mx = 0, my = 0, t = 0, last = performance.now(), raf = 0, visible = true;
  const onMove = (e: PointerEvent) => { mx = (e.clientX / window.innerWidth) * 2 - 1; my = (e.clientY / window.innerHeight) * 2 - 1; };
  const size = () => { const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("resize", size);
  size();
  const io = new IntersectionObserver((es) => (visible = es[0].isIntersecting));
  io.observe(canvas);

  function loop(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    if (motionState.on) t += dt;
    if (visible) {
      u.uT.value = t;
      u.uM.value.x += (mx - u.uM.value.x) * 0.06;
      u.uM.value.y += (my - u.uM.value.y) * 0.06;
      cam.position.x += (mx * 1.5 - cam.position.x) * 0.03;
      cam.lookAt(0, 0, -14);
      r.render(scene, cam);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    recolor: () => u.uHi.value.set(css("--accent")),
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      r.dispose();
    },
  };
}
