// One-screen sections.
// 1. Fit: if a screen's content is taller than the browser window, scale it down with CSS zoom
//    (text stays sharp and the layout reflows) until it fits, never below MIN_ZOOM.
// 2. Tone: the header and section rail switch colours to match the screen beneath them.
// 3. Position: the rail and main nav mark the screen in view.
const MIN_ZOOM = 0.8;

export function initScreens() {
  const screens = [...document.querySelectorAll('[data-screen]')];
  if (!screens.length) return;

  const header = document.querySelector('[data-header]');
  const rail = document.querySelector('[data-rail]');
  const railLinks = rail ? [...rail.querySelectorAll('[data-rail-for]')] : [];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const canZoom = window.CSS && CSS.supports('zoom', '0.5');
  const fitQuery = window.matchMedia('(min-width: 700px) and (min-height: 540px)');

  // Measures 100svh in pixels (window.innerHeight can include mobile browser bars).
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);

  const fitScreen = (screen, vh) => {
    const box = screen.querySelector('[data-fit]');
    if (!box) return;
    box.style.zoom = '';
    if (!canZoom || !fitQuery.matches) return;

    const total = screen.getBoundingClientRect().height;
    if (total <= vh + 1) return;

    // Everything in the screen that is not the fitted box: paddings, footer.
    const content = box.getBoundingClientRect().height;
    const other = total - content;
    let zoom = Math.max(MIN_ZOOM, (vh - other) / content);

    for (let i = 0; i < 4; i += 1) {
      box.style.zoom = zoom.toFixed(3);
      const now = screen.getBoundingClientRect().height;
      if (now <= vh + 1 || zoom <= MIN_ZOOM) break;
      zoom = Math.max(MIN_ZOOM, zoom * ((vh - other) / (now - other)) * 0.995);
    }
  };

  const fitAll = () => {
    const vh = probe.getBoundingClientRect().height;
    screens.forEach((screen) => fitScreen(screen, vh));
    document.documentElement.classList.add('is-fitted');
    update();
  };

  const update = () => {
    const headerMid = header ? header.offsetHeight / 2 : 0;
    const viewMid = window.innerHeight / 2;
    let under = screens[0];
    let current = screens[0];
    for (const screen of screens) {
      const r = screen.getBoundingClientRect();
      if (r.top <= headerMid && r.bottom > headerMid) under = screen;
      if (r.top <= viewMid && r.bottom > viewMid) current = screen;
    }
    if (header) {
      header.dataset.tone = under.dataset.tone || 'light';
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    if (rail) rail.dataset.tone = current.dataset.tone || 'light';
    for (const link of railLinks) {
      if (link.dataset.railFor === current.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    for (const link of navLinks) {
      if (link.dataset.nav.split(' ').includes(current.id)) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      update();
    });
  }, { passive: true });

  let resizeQueued = 0;
  const queueFit = () => {
    cancelAnimationFrame(resizeQueued);
    resizeQueued = requestAnimationFrame(fitAll);
  };
  window.addEventListener('resize', queueFit);
  fitQuery.addEventListener('change', queueFit);

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener('load', fitAll, { once: true });
}
