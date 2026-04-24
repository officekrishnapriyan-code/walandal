export function initNav() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('nav-progress');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (y > 80) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
    if (progress) progress.style.width = `${(y / max) * 100}%`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';

      // Stagger reveal links via GSAP if available
      if (open && window.gsap) {
        window.gsap.fromTo(
          menu.querySelectorAll('nav a'),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
        );
      }
    });

    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      })
    );
  }

  // Live timestamp
  const ts = document.getElementById('hero-timestamp');
  if (ts) {
    function tick() {
      const opts = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const now = new Intl.DateTimeFormat('en-GB', opts).format(new Date());
      ts.textContent = `KOCHI · IST · ${now}`;
    }
    tick();
    setInterval(tick, 1000);
  }
}
