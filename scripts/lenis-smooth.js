import { prefersReducedMotion } from './utils.js';

export function initLenis() {
  if (prefersReducedMotion()) return null;

  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });

  // Hook into GSAP ticker so ScrollTrigger updates correctly
  if (window.gsap) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  return lenis;
}
