import { prefersReducedMotion } from './utils.js';

export function initLenis() {
  if (prefersReducedMotion()) return null;
  if (typeof window.Lenis === 'undefined') return null;
  if (window.matchMedia('(pointer: coarse)').matches) return null;

  const lenis = new window.Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    autoRaf: false,
  });

  // Official Lenis ↔ GSAP bridge — single RAF driver via gsap.ticker
  if (window.gsap && window.ScrollTrigger) {
    window.ScrollTrigger.config({ ignoreMobileResize: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  window.__lenis = lenis;

  // Anchor link smooth-scroll integration
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });

  return lenis;
}
