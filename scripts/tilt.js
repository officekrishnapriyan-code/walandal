import { prefersReducedMotion, isTouch } from './utils.js';

export function initTilt() {
  if (prefersReducedMotion() || isTouch()) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = el.classList.contains('capability-card') ? 8 : 6;
    let rect;

    function onEnter() { rect = el.getBoundingClientRect(); el.style.transition = 'transform 0.15s ease-out'; }
    function onMove(e) {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) *  2 * max;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    }
    function onLeave() {
      el.style.transition = 'transform 0.6s var(--ease-out-expo)';
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      rect = null;
    }
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}
