import { initLenis }      from './lenis-smooth.js';
import { initCursor }     from './cursor.js';
import { initNav }        from './nav.js';
import { initReveals }    from './reveals.js';
import { initCounters }   from './counters.js';
import { initSystemsPin } from './systems-pin.js';
import { initTilt }       from './tilt.js';
import { initMarquee }    from './marquee.js';
import { initForm }       from './form.js';

// Timestamp
function updateTimestamp() {
  const el = document.querySelector('.hero-timestamp');
  if (!el) return;
  const now = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'Asia/Kolkata'
  });
  el.textContent = `KOCHI · IST · ${now}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCursor();
  initNav();
  initReveals();
  initCounters();
  initSystemsPin();
  initTilt();
  initMarquee();
  initForm();

  updateTimestamp();
  setInterval(updateTimestamp, 1000);

  // Lazy-init WebGL after first paint
  const launchWebGL = () => {
    import('./hero-webgl.js').then(m => m.initHeroWebGL());
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(launchWebGL, { timeout: 2000 });
  } else {
    setTimeout(launchWebGL, 0);
  }
});
