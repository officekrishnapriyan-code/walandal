import { onReady, waitFor } from './utils.js';
import { initLenis } from './lenis-smooth.js';
import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initForm } from './form.js';
import { initAquaDemo } from './aqua-demo.js';
import { initField } from './field.js';
import { initChapters } from './chapters.js';
import { initDeviceFit, initStepper, initLoop, initRealms, initSpotlight } from './interactions.js';

onReady(async () => {
  // Layout-critical pieces first, so nothing jumps once GSAP arrives.
  initDeviceFit();
  initField();

  try { await waitFor(() => window.gsap && window.ScrollTrigger, 30, 4000); } catch { /* run without GSAP */ }

  initLenis();
  initNav();
  initCursor();
  initForm();
  initChapters();
  initAquaDemo();
  initStepper();
  initLoop();
  initRealms();
  initSpotlight();
});
