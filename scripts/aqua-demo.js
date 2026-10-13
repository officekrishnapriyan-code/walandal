import { prefersReducedMotion } from './utils.js';

/**
 * Keeps the Aqua Insight phone mock-up alive: readings drift every couple of
 * seconds, the critical tank's chlorine recovers after an auto-dose, and the
 * WQI ring follows. Pure demo data — nothing is fetched.
 */
export function initAquaDemo() {
  const root = document.getElementById('aqua-demo');
  if (!root || prefersReducedMotion()) return;

  const ring = document.getElementById('demo-ring');
  const wqiEl = document.getElementById('demo-wqi');
  const gradeEl = document.getElementById('demo-grade');
  const crit = root.querySelector('[data-tank="crit"]');
  const ok = root.querySelector('[data-tank="ok"]');
  const CIRC = 2 * Math.PI * 32;

  const state = {
    crit: { ph: 7.08, cl: 0.14, tds: 428, ntu: 0.66 },
    ok: { ph: 7.42, cl: 0.68, tds: 312, ntu: 0.42 },
  };
  let tick = 0;

  const jitter = (v, amt, min, max) => Math.min(max, Math.max(min, v + (Math.random() - 0.5) * amt));
  const fmt = { ph: (v) => v.toFixed(2), cl: (v) => v.toFixed(2), tds: (v) => Math.round(v), ntu: (v) => v.toFixed(2) };

  function paint(card, s) {
    card.querySelectorAll('[data-m]').forEach((b) => { b.textContent = fmt[b.dataset.m](s[b.dataset.m]); });
  }

  function update() {
    tick++;
    // Critical tank: chlorine climbs back after dosing, then the cycle repeats.
    const phase = tick % 16;
    state.crit.cl = phase < 10 ? 0.14 + phase * 0.06 : 0.74 - (phase - 10) * 0.1;
    state.crit.ph = jitter(state.crit.ph, 0.04, 6.9, 7.3);
    state.crit.tds = jitter(state.crit.tds, 6, 410, 440);
    state.crit.ntu = jitter(state.crit.ntu, 0.04, 0.5, 0.8);
    state.ok.ph = jitter(state.ok.ph, 0.03, 7.3, 7.55);
    state.ok.cl = jitter(state.ok.cl, 0.02, 0.6, 0.75);
    state.ok.tds = jitter(state.ok.tds, 5, 300, 325);
    state.ok.ntu = jitter(state.ok.ntu, 0.03, 0.35, 0.5);

    paint(crit, state.crit);
    paint(ok, state.ok);

    const isCrit = state.crit.cl < 0.2;
    crit.classList.toggle('app-card--crit', isCrit);
    crit.querySelector('.app-metrics > div:nth-child(2)').classList.toggle('is-crit', isCrit);
    const pill = crit.querySelector('.app-pill');
    pill.textContent = isCrit ? 'Critical' : 'Optimal';
    pill.className = `app-pill ${isCrit ? 'app-pill--crit' : 'app-pill--ok'}`;
    crit.querySelector('.app-bar').className = `app-bar ${isCrit ? 'app-bar--crit' : 'app-bar--ok'}`;
    crit.querySelector('.app-dose').style.visibility = state.crit.cl < 0.5 ? 'visible' : 'hidden';

    const wqi = Math.round(isCrit ? 84 + Math.random() * 2 : 91 + Math.random() * 3);
    wqiEl.textContent = wqi;
    ring.style.strokeDashoffset = String(CIRC * (1 - wqi / 100));
    gradeEl.textContent = wqi >= 90 ? 'Excellent' : 'Good';
    gradeEl.style.color = wqi >= 90 ? '#3DDC97' : '#7DD3C0';
  }

  // Only animate while the mock-up is on screen.
  let timer = 0;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !timer) timer = setInterval(update, 1800);
    if (!e.isIntersecting && timer) { clearInterval(timer); timer = 0; }
  }).observe(root);
  update();
}
