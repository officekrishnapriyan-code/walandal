import { prefersReducedMotion } from './utils.js';

const reduced = () => prefersReducedMotion();

/** Scales the 360×740 phone mock-up to whatever height the layout gives it. */
export function initDeviceFit() {
  const fit = document.getElementById('device-fit');
  if (!fit) return;
  const apply = () => fit.style.setProperty('--device-scale', String(fit.clientHeight / 740));
  new ResizeObserver(apply).observe(fit);
  apply();
}

/** Accessible tabs with optional auto-advance and a progress bar. */
function tabs({ tablist, panels, onSelect, interval, bar }) {
  const buttons = Array.from(tablist.querySelectorAll('[role="tab"]'));
  let index = 0, start = performance.now(), paused = false, visible = false;

  function select(i, focus = false) {
    index = (i + buttons.length) % buttons.length;
    buttons.forEach((b, k) => {
      const on = k === index;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (panels) {
        const p = panels[k];
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      }
    });
    if (focus) buttons[index].focus();
    if (buttons[index].scrollIntoView && tablist.scrollWidth > tablist.clientWidth) {
      tablist.scrollTo({ left: buttons[index].offsetLeft - 20, behavior: 'smooth' });
    }
    onSelect?.(index);
    start = performance.now();
  }

  buttons.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(index + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(index - 1, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(buttons.length - 1, true); }
    });
  });

  const host = tablist.closest('.chapter');
  host.addEventListener('pointerenter', () => (paused = true));
  host.addEventListener('pointerleave', () => { paused = false; start = performance.now(); });
  host.addEventListener('focusin', () => (paused = true));
  host.addEventListener('focusout', () => (paused = false));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start = performance.now(); }, { threshold: 0.4 }).observe(host);

  if (interval && !reduced()) {
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible || paused) { start = now - (bar ? parseFloat(bar.dataset.p || 0) * interval : 0); return; }
      const p = Math.min(1, (now - start) / interval);
      if (bar) { bar.style.width = `${p * 100}%`; bar.dataset.p = String(p); }
      if (p >= 1) select(index + 1);
    };
    requestAnimationFrame(loop);
  }
  select(0);
  return { select };
}

export function initStepper() {
  const root = document.getElementById('work-stepper');
  if (!root) return;
  tabs({
    tablist: root.querySelector('[role="tablist"]'),
    panels: Array.from(root.querySelectorAll('[role="tabpanel"]')),
    interval: 5200,
    bar: document.getElementById('stepper-bar'),
  });
}

const STEPS = [
  ['Sense', 'Solar ESP32 kit on the tank: chlorine, pH, TDS, turbidity, level, and a chlorine doser.'],
  ['Connect', 'MQTT over TLS into AWS IoT Core, with a certificate for each device.'],
  ['Buffer', 'IoT rules route every message into a durable queue, so no reading is lost.'],
  ['Process', "Containers validate, store and evaluate each reading against safe limits."],
  ['Remember', "A time-series database keeps every tank's history for trends and audits."],
  ['Act', 'Alerts, the mobile app and reports, plus a dose command back to the tank.'],
];

/** The closed-loop pipeline: nodes on a ring, a comet travelling the loop. */
export function initLoop() {
  const loop = document.getElementById('loop');
  if (!loop) return;
  const nodes = Array.from(loop.querySelectorAll('.loop__nodes button'));
  const arc = document.getElementById('loop-arc');
  const comet = document.getElementById('loop-comet');
  const detail = document.querySelector('.loop-detail');
  const num = document.getElementById('loop-num');
  const title = document.getElementById('loop-title');
  const text = document.getElementById('loop-text');
  const CIRC = 2 * Math.PI * 150;

  function layout() {
    const r = (loop.clientWidth * 150) / 400;
    nodes.forEach((b, i) => {
      const deg = i * 60;
      b.style.setProperty('--a', `${deg}deg`);
      b.style.setProperty('--r', `${r}px`);
      // Anchor each label on the outside of its node: above/below for the
      // top and bottom nodes, to the side for the others.
      const rad = (deg * Math.PI) / 180;
      const sx = Math.sin(rad), sy = -Math.cos(rad);
      const span = b.querySelector('span');
      if (Math.abs(sx) < 0.2) {
        span.style.transform = `translate(-50%, ${sy < 0 ? 'calc(-100% - 16px)' : '16px'})`;
      } else {
        span.style.transform = `translate(${sx > 0 ? '16px' : 'calc(-100% - 16px)'}, -50%)`;
      }
    });
  }
  new ResizeObserver(layout).observe(loop);
  layout();

  tabs({
    tablist: loop.querySelector('[role="tablist"]'),
    interval: 3400,
    onSelect: (i) => {
      num.textContent = `0${i + 1} / 06`;
      title.textContent = STEPS[i][0];
      text.textContent = STEPS[i][1];
      detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap');
      arc.style.strokeDashoffset = String(CIRC * (1 - (i + 1) / 6));
    },
  });

  if (reduced()) return;
  let a = 0, last = performance.now(), running = false;
  const spin = (now) => {
    if (!running) return;
    requestAnimationFrame(spin);
    a += ((now - last) / 1000) * 0.9; last = now;
    comet.setAttribute('cx', String(200 + Math.sin(a) * 150));
    comet.setAttribute('cy', String(200 - Math.cos(a) * 150));
  };
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) { last = performance.now(); requestAnimationFrame(spin); }
  }).observe(loop);
}

/** Water / Air / Land expanding panels (hover, click or keyboard). */
export function initRealms() {
  const realms = Array.from(document.querySelectorAll('.realm'));
  const open = (r) => realms.forEach((x) => {
    const on = x === r;
    x.classList.toggle('is-open', on);
    x.setAttribute('aria-expanded', String(on));
  });
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  realms.forEach((r) => {
    if (fine) r.addEventListener('mouseenter', () => open(r));
    r.addEventListener('click', () => open(r));
    r.addEventListener('focus', () => open(r));
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(r); } });
  });
}

/** Spotlight that follows the pointer across capability tiles. */
export function initSpotlight() {
  document.querySelectorAll('.layers li').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
}
