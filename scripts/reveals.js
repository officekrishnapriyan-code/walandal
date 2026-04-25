import { prefersReducedMotion } from './utils.js';

export function initReveals() {
  const reduced = prefersReducedMotion();
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;

  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // ---------- Hero load timeline ----------
  if (gsap && !reduced) {
    const eyebrow = document.querySelector('.hero__eyebrow');
    const title   = document.getElementById('hero-title');
    const sub     = document.getElementById('hero-subhead');
    const cta     = document.getElementById('hero-cta');
    const hint    = document.getElementById('hero-scroll-hint');
    const stamp   = document.getElementById('hero-timestamp');

    let chars;
    // Skip SplitText for hero title — it breaks the .accent gradient span.
    // Animate the whole title as one element instead.
    chars = null;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (eyebrow) tl.fromTo(eyebrow, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    if (title)   tl.fromTo(title,   { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.2');
    if (sub) tl.fromTo(sub, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.5);
    if (cta) tl.fromTo(cta.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.8);
    if (hint) tl.to(hint, { opacity: 1, duration: 0.7 }, 1.2);
    if (stamp) tl.to(stamp, { opacity: 1, duration: 0.7 }, 1.2);
  } else {
    // Reduced motion — just show
    document.querySelectorAll('.hero__eyebrow, #hero-subhead, #hero-cta, #hero-scroll-hint, #hero-timestamp').forEach((el) => {
      if (el) el.style.opacity = '1';
    });
  }

  // ---------- Generic reveal ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -15% 0px' });

  document.querySelectorAll('.reveal, .domain-card').forEach((el) => io.observe(el));

  // ---------- Reveal-stagger ----------
  document.querySelectorAll('.reveal-stagger').forEach((parent) => {
    const children = Array.from(parent.children);
    children.forEach((c, i) => {
      c.style.transition = 'opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo)';
      c.style.transitionDelay = `${i * 0.08}s`;
      c.style.opacity = '0';
      c.style.transform = 'translate3d(0,30px,0)';
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        children.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'translate3d(0,0,0)'; });
        obs.unobserve(parent);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    obs.observe(parent);
  });

  // ---------- Lines reveal for h2 ----------
  document.querySelectorAll('.reveal-lines').forEach((el) => {
    if (reduced) return;
    const text = el.innerHTML.trim();
    // Wrap each word in a line span (line clipping mask)
    const words = text.split(/(\s+)/);
    el.innerHTML = words.map((w) => {
      if (/^\s+$/.test(w)) return w;
      return `<span class="line"><span>${w}</span></span>`;
    }).join('');
  });
  const linesObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      linesObs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal-lines').forEach((el) => linesObs.observe(el));

  // ---------- Manifesto word-by-word scrub ----------
  const stmt = document.getElementById('manifesto-statement');
  if (stmt && gsap && ScrollTrigger && !reduced) {
    const text = stmt.textContent.trim();
    stmt.innerHTML = text.split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(' ');
    const words = stmt.querySelectorAll('.word');

    // All words fill together as the block scrolls into the centre of the viewport
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.08,          // tiny stagger — left to right, feels natural
      scrollTrigger: {
        trigger: stmt,
        start: 'center 65%',  // start filling when centre of text is 65% down
        end: 'center 35%',    // fully white when centre reaches 35% (above mid)
        scrub: 0.5,
      },
    });
  } else if (stmt && reduced) {
    const text = stmt.textContent.trim();
    stmt.innerHTML = text.split(/\s+/).map((w) => `<span class="word" style="opacity:1">${w}</span>`).join(' ');
  }

  // ---------- Emission bar visualization ----------
  document.querySelectorAll('.visual-emission').forEach((vis) => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        vis.querySelectorAll('.bar').forEach((bar) => {
          const h = parseFloat(bar.dataset.h || '60');
          bar.setAttribute('height', h);
          bar.setAttribute('y', 280 - h);
        });
        obs.unobserve(vis);
      });
    }, { threshold: 0.3 });
    obs.observe(vis);
  });
}
