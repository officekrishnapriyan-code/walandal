import { prefersReducedMotion } from './utils.js';

export function initSystemsPin() {
  const section = document.querySelector('.systems');
  const track   = document.getElementById('systems-track');
  const dotsWrap = document.getElementById('systems-dots');
  if (!section || !track) return;

  const dots  = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.dot')) : [];
  const cards = Array.from(track.children);

  function updateDots(progress) {
    const idx = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  // Mobile fallback — vertical stack, no pin
  if (prefersReducedMotion() || !window.gsap || !window.ScrollTrigger) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx = cards.indexOf(e.target);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }, { threshold: 0.5 });
    cards.forEach((c) => obs.observe(c));
    return;
  }

  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  function getDistance() {
    return track.scrollWidth - window.innerWidth;
  }

  function buildPin() {
    // Kill any existing instance first
    ST.getAll().forEach((t) => {
      if (t.vars && t.vars.trigger === section) t.kill();
    });

    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.6,
        start: 'top top',
        end: () => '+=' + getDistance(),
        invalidateOnRefresh: true,
        onUpdate: (self) => updateDots(self.progress),
      },
    });

    ST.refresh();
  }

  // Use gsap.matchMedia so desktop/mobile is re-evaluated on resize
  const mm = gsap.matchMedia();

  mm.add('(min-width: 841px)', () => {
    // Wait for fonts to settle before measuring track width
    const ready = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();
    ready.then(buildPin);

    return () => {
      ST.getAll().forEach((t) => {
        if (t.vars && t.vars.trigger === section) t.kill();
      });
    };
  });

  mm.add('(max-width: 840px)', () => {
    // Vertical stack — dots via IntersectionObserver
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx = cards.indexOf(e.target);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }, { threshold: 0.5 });
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  });

  // Debounced refresh on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ST.refresh(), 250);
  });
}
