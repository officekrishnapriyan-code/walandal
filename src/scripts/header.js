// Header menu for narrow screens. The header itself always stays visible;
// its colours and scrolled state are handled in screens.js.
export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const button = header.querySelector('[data-menu]');
  const label = header.querySelector('[data-menu-label]');
  const nav = header.querySelector('#site-nav');

  const setMenu = (open) => {
    header.classList.toggle('menu-open', open);
    if (button) button.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
  };

  if (button) {
    button.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  }
  if (nav) {
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      setMenu(false);
      if (button) button.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (header.classList.contains('menu-open') && !header.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}
