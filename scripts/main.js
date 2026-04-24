import { onReady, waitFor } from './utils.js';
import { initLenis } from './lenis-smooth.js';
import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initHeroWebGL } from './hero-webgl.js';
import { initReveals } from './reveals.js';
import { initCounters } from './counters.js';
import { initSystemsPin } from './systems-pin.js';
import { initTilt } from './tilt.js';
import { initMarquee } from './marquee.js';
import { initForm } from './form.js';

onReady(async () => {
  // Wait for GSAP + ScrollTrigger from CDN (deferred). Lenis is optional.
  try { await waitFor(() => window.gsap && window.ScrollTrigger, 30, 4000); } catch { /* continue without GSAP */ }

  // Sync DOM-only behaviour first
  initNav();
  initCursor();
  initTilt();
  initMarquee();
  initForm();
  initCounters();

  // Reveal/scroll bound — needs GSAP if available
  initReveals();
  initSystemsPin();

  // Smooth scroll
  initLenis();

  // WebGL hero — defer to keep first paint snappy
  const start = () => initHeroWebGL();
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 800 });
  else setTimeout(start, 0);
});
