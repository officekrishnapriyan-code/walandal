import { prefersReducedMotion } from './utils.js';

/** Chapter entrances, the chapter rail, the manifesto scrub and the clock. */
export function initChapters() {
  const chapters = document.querySelectorAll('.chapter');

  // Entrance: add .is-in when a chapter is meaningfully on screen.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  chapters.forEach((c) => io.observe(c));
  // The hero is always visible on load.
  requestAnimationFrame(() => document.getElementById('hero')?.classList.add('is-in'));

  // Rail: highlight the chapter at the middle of the screen.
  const rail = document.querySelectorAll('#rail a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      rail.forEach((a) => a.classList.toggle('is-active', a.dataset.ch === e.target.id));
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  chapters.forEach((c) => spy.observe(c));

  // Manifesto: words light up as the statement crosses the screen.
  const stmt = document.getElementById('manifesto-statement');
  if (stmt) {
    const words = stmt.textContent.trim().split(/\s+/);
    stmt.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(' ');
    const spans = stmt.querySelectorAll('.word');
    if (prefersReducedMotion() || !(window.gsap && window.ScrollTrigger)) {
      spans.forEach((s) => (s.style.opacity = '1'));
    } else {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.to(spans, {
        opacity: 1, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: stmt, start: 'top 75%', end: 'bottom 40%', scrub: 0.5 },
      });
    }
  }

  // IST clock in the hero readout.
  const clock = document.getElementById('hero-clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { clock.textContent = `INDIA · IST · ${fmt.format(new Date())}`; };
    tick();
    setInterval(tick, 1000);
  }
}
