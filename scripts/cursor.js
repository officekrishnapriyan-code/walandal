import { prefersReducedMotion, isTouchDevice, lerp } from './utils.js';

export function initCursor() {
  if (prefersReducedMotion() || isTouchDevice()) return;

  const ring = document.createElement('div');
  const dot  = document.createElement('div');
  ring.className = 'cursor-ring';
  dot.className  = 'cursor-dot';
  document.body.append(ring, dot);
  document.body.style.cursor = 'none';

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Magnetic elements
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const ox = e.clientX - (r.left + r.width  / 2);
      const oy = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${ox * 0.18}px, ${oy * 0.18}px)`;
      ring.style.transform = 'translate(-50%,-50%) scale(1.6)';
      ring.style.background = 'rgba(20,224,213,0.15)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.background = '';
    });
  });

  // Text cursor
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
  });
}
