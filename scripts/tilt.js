import { prefersReducedMotion, isTouchDevice } from './utils.js';

export function initTilt() {
  if (prefersReducedMotion() || isTouchDevice()) return;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    const maxDeg = parseFloat(card.dataset.tilt) || 6;

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * maxDeg * 2}deg) rotateX(${-y * maxDeg * 2}deg)`;
      card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - r.top)  / r.height * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
