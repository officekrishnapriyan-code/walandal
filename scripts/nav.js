export function initNav() {
  const nav      = document.getElementById('nav');
  const progress = document.getElementById('nav-progress');
  const toggle   = document.getElementById('nav-toggle');
  const menu     = document.getElementById('mobile-menu');

  // ── Scroll state + progress bar ──────────────────────────────
  function onScroll() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.dataset.state = y > 12 ? 'scrolled' : 'top';
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });


  // ── Scrollspy ────────────────────────────────────────────────
  const links = document.querySelectorAll('.nav__links a[href^="#"]');
  const map   = new Map();
  links.forEach((a) => {
    const id  = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = map.get(e.target);
      if (!link) return;
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  map.forEach((_, sec) => spy.observe(sec));

  // ── Mobile hamburger ─────────────────────────────────────────
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';

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

  // ── Hero timestamp (keep existing) ───────────────────────────
  const ts = document.getElementById('hero-timestamp');
  if (ts) {
    function tick() {
      const opts = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const now  = new Intl.DateTimeFormat('en-GB', opts).format(new Date());
      ts.textContent = `KOCHI · IST · ${now}`;
    }
    tick();
    setInterval(tick, 1000);
  }
}
