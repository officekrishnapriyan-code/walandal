import { prefersReducedMotion } from './utils.js';

export function initCounters() {
  const reduced = prefersReducedMotion();

  // Numeric counters
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseFloat(el.dataset.counter || '0');
    if (reduced) { el.textContent = String(target); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const start = performance.now();
        const dur = 1600;
        function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // Typewriter values (e.g. 24/7, 100%, ROS 2)
  document.querySelectorAll('[data-typewriter]').forEach((el) => {
    const value = el.dataset.typewriter || '';
    if (reduced) { el.textContent = value; return; }
    el.textContent = '';
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        let i = 0;
        const speed = 90;
        const next = () => {
          if (i > value.length) return;
          el.textContent = value.slice(0, i);
          i++;
          setTimeout(next, speed);
        };
        next();
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}
