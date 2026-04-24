import { prefersReducedMotion } from './utils.js';

export function initCounters() {
  const metrics = document.querySelectorAll('[data-count]');
  if (!metrics.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el     = e.target;
      const target = el.dataset.count;
      const isNum  = /^\d+$/.test(target);

      if (prefersReducedMotion() || !isNum) {
        el.textContent = target;
        return;
      }

      const end      = parseInt(target, 10);
      const duration = 1600;
      const start    = performance.now();

      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * end);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  metrics.forEach(el => io.observe(el));
}
