import { prefersReducedMotion, isTouch } from './utils.js';

/**
 * Hero "field": animated contour lines drawn with marching squares over a
 * drifting noise surface. Read one way they are ripples on water, another
 * way isobars in air, another way terrain contours — Water, Air, Land.
 * The pointer presses a gentle well into the surface.
 */

// --- 3D gradient noise (Perlin, improved) -----------------------------------
const P = new Uint8Array(512);
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1337;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
})();
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + t * (b - a);
function grad(h, x, y, z) {
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
function noise(x, y, z) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z, B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
  return lerp(
    lerp(lerp(grad(P[AA] & 15, x, y, z), grad(P[BA] & 15, x - 1, y, z), u),
         lerp(grad(P[AB] & 15, x, y - 1, z), grad(P[BB] & 15, x - 1, y - 1, z), u), v),
    lerp(lerp(grad(P[AA + 1] & 15, x, y, z - 1), grad(P[BA + 1] & 15, x - 1, y, z - 1), u),
         lerp(grad(P[AB + 1] & 15, x, y - 1, z - 1), grad(P[BB + 1] & 15, x - 1, y - 1, z - 1), u), v),
    w);
}

export function initField() {
  const canvas = document.getElementById('field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = prefersReducedMotion();

  const LEVELS = 14;
  let W = 0, H = 0, dpr = 1, cell = 16, cols = 0, rows = 0, grid = new Float32Array(0);
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let t = Math.random() * 100;
  let running = false;
  let last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    cell = W < 700 ? 13 : 17;
    cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1;
    grid = new Float32Array(cols * rows);
  }

  function sample() {
    const sc = 0.0042 * (W < 700 ? 1.5 : 1);
    const r2 = (Math.min(W, H) * 0.22) ** 2;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * cell, y = j * cell;
        let v = noise(x * sc, y * sc, t) * 0.75 + noise(x * sc * 2.1, y * sc * 2.1, t * 1.3) * 0.25;
        const dx = x - mouse.x, dy = y - mouse.y;
        v -= 0.55 * Math.exp(-(dx * dx + dy * dy) / r2);
        grid[j * cols + i] = v;
      }
    }
  }

  // Marching squares for one iso level, appended to the current path.
  function contour(level) {
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = grid[j * cols + i], b = grid[j * cols + i + 1];
        const c = grid[(j + 1) * cols + i + 1], d = grid[(j + 1) * cols + i];
        const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * cell, y = j * cell;
        const top = [x + cell * ((level - a) / (b - a)), y];
        const right = [x + cell, y + cell * ((level - b) / (c - b))];
        const bottom = [x + cell * ((level - d) / (c - d)), y + cell];
        const left = [x, y + cell * ((level - a) / (d - a))];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 10: seg(left, bottom); seg(top, right); break;
        }
      }
    }
  }

  function draw() {
    sample();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (let k = 0; k < LEVELS; k++) {
      const level = -0.7 + (1.4 * k) / (LEVELS - 1);
      const major = k % 4 === 0;
      const g = ctx.createLinearGradient(0, 0, W, H);
      const a = major ? 0.55 : 0.2;
      g.addColorStop(0, `rgba(20, 224, 213, ${a})`);
      g.addColorStop(1, `rgba(139, 209, 124, ${a * 0.8})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = major ? 1.2 : 0.7;
      ctx.beginPath();
      contour(level);
      ctx.stroke();
    }
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30 fps is plenty for slow drift
    last = now;
    t += 0.0045;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    draw();
  }

  resize();
  draw();
  canvas.classList.add('is-ready');
  if (reduced) return;

  if (!isTouch()) {
    canvas.parentElement.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      if (mouse.x < -1000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    }, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.tx = -9999; mouse.ty = -9999; });
  }

  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); draw(); }, 150); });

  // Only animate while the hero is visible.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; requestAnimationFrame(frame); }
    else if (!e.isIntersecting) running = false;
  }).observe(canvas);
}
