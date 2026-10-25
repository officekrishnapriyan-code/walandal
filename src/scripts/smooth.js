// Smooth scrolling for mouse and trackpad (Lenis): wheel input glides with momentum, in-page
// links ease to their screen, and when scrolling comes to rest close to a screen's top edge
// the page settles onto it. Touch devices keep native scrolling (with CSS snap), and
// people who ask for reduced motion keep plain scrolling.
import Lenis from 'lenis';

const SNAP_RANGE = 0.22; // settle only when within 22% of a window height from a screen edge
const SNAP_DELAY = 160;

export function initSmoothScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce || !finePointer) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // In-page links glide to their target instead of jumping.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id || id === 'main') return; // the skip link keeps its native focus behaviour
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { duration: 1.4 });
    history.replaceState(null, '', `#${id}`);
  });

  // Settle onto the nearest screen once scrolling stops near its edge.
  const screens = [...document.querySelectorAll('[data-screen]')];
  let timer = 0;
  let settling = false;
  lenis.on('scroll', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (settling) {
        settling = false;
        return;
      }
      const y = window.scrollY;
      const vh = window.innerHeight;
      const maxY = document.documentElement.scrollHeight - vh;
      let best = null;
      let distance = Infinity;
      // The page end is a resting point too, so the footer can be read without being pulled back.
      const stops = [...screens.map((screen) => screen.getBoundingClientRect().top + y), maxY];
      for (const stop of stops) {
        const top = Math.min(maxY, stop);
        const d = Math.abs(top - y);
        if (d < distance) {
          distance = d;
          best = top;
        }
      }
      if (best !== null && distance > 2 && distance < vh * SNAP_RANGE) {
        settling = true;
        lenis.scrollTo(best, { duration: 0.9 });
      }
    }, SNAP_DELAY);
  });

  return lenis;
}
