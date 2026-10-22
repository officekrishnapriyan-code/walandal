import { initHeader } from './scripts/header.js';
import { initScreens } from './scripts/screens.js';
import { initLens } from './scripts/lens.js';
import { initReveal } from './scripts/reveal.js';
import { initForm } from './scripts/form.js';
import { initSmoothScroll } from './scripts/smooth.js';

initHeader();
initScreens();
initSmoothScroll();
initLens();
initReveal();
initForm();

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});
