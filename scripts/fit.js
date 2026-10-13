import { debounce } from './utils.js';

/**
 * Scales the Aqua Insight phone mock-up (designed at 360×740) so it fits the
 * screen height, whatever the device. CSS reads the result as --device-scale.
 */
export function initFit() {
  const frame = document.querySelector('.device-frame');
  if (!frame) return;

  const DESIGN_H = 740;
  function apply() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const phone = vw <= 760;
    // Share of the screen height the phone may use.
    const share = phone ? 0.3 : vw <= 1100 ? 0.48 : 0.53;
    const maxH = phone ? 420 : 640;
    const target = Math.max(phone ? 190 : 260, Math.min(maxH, vh * share));
    frame.style.setProperty('--device-scale', (target / DESIGN_H).toFixed(4));
  }
  apply();
  window.addEventListener('resize', debounce(apply, 100));
  window.addEventListener('orientationchange', apply);
}
