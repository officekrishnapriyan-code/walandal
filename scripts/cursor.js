import { prefersReducedMotion, isTouch, lerp } from './utils.js';

export function initCursor() {
  if (prefersReducedMotion() || isTouch()) return;

  const cursor = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor__ring');
  const dot = document.querySelector('.cursor__dot');
  if (!cursor || !ring || !dot) return;

  document.body.classList.add('has-cursor');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  function loop() {
    rx = lerp(rx, mx, 0.28);
    ry = lerp(ry, my, 0.28);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Magnetic + state hovers
  const magnetics = document.querySelectorAll('[data-magnetic]');
  magnetics.forEach((el) => {
    let magRaf = 0;
    el.addEventListener('mouseenter', () => cursor.classList.add('is-magnetic'));
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-magnetic');
      el.style.transform = '';
    });
    el.addEventListener('mousemove', (e) => {
      const cx = e.clientX, cy = e.clientY;
      if (magRaf) return;
      magRaf = requestAnimationFrame(() => {
        magRaf = 0;
        const rect = el.getBoundingClientRect();
        const dx = cx - (rect.left + rect.width / 2);
        const dy = cy - (rect.top + rect.height / 2);
        el.style.transform = `translate3d(${dx * 0.18}px, ${dy * 0.18}px, 0)`;
      });
    });
  });

  // Text inputs → caret state
  document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-text'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-text'));
  });
}
