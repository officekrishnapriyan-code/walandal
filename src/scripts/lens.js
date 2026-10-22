// Hero lens: drifts slowly across the headline and follows the pointer on devices with a mouse.
// Only two CSS custom properties change per frame, so the browser never re-lays out text.
export function initLens() {
  const box = document.querySelector('[data-lens]');
  if (!box) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = box.closest('.hero') || box;
  const pos = { x: 16, y: 34 };
  const start = performance.now();
  let target = null;
  let raf = 0;
  let inView = true;
  let running = false;

  // A slow Lissajous path: about 30 s across and 19 s up and down.
  const drift = (t) => ({
    x: 50 + 36 * Math.sin(t * 0.00021),
    y: 52 + 30 * Math.sin(t * 0.00033 + 1.1),
  });

  const frame = (now) => {
    const goal = target || drift(now - start);
    const ease = target ? 0.14 : 0.05;
    pos.x += (goal.x - pos.x) * ease;
    pos.y += (goal.y - pos.y) * ease;
    box.style.setProperty('--lx', `${pos.x.toFixed(2)}%`);
    box.style.setProperty('--ly', `${pos.y.toFixed(2)}%`);
    raf = requestAnimationFrame(frame);
  };

  const play = () => {
    if (running || !inView || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) play();
    else stop();
  }).observe(box);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  hero.addEventListener('pointermove', (event) => {
    if (!finePointer.matches) return;
    const r = box.getBoundingClientRect();
    target = {
      x: Math.min(100, Math.max(0, ((event.clientX - r.left) / r.width) * 100)),
      y: Math.min(110, Math.max(-10, ((event.clientY - r.top) / r.height) * 100)),
    };
  });
  hero.addEventListener('pointerleave', () => {
    target = null;
  });

  play();
}
