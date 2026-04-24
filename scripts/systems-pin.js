import { prefersReducedMotion } from './utils.js';

export function initSystemsPin() {
  const pin = document.getElementById('systems-pin');
  const track = document.getElementById('systems-track');
  const dotsWrap = document.getElementById('systems-dots');
  if (!pin || !track) return;

  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.dot')) : [];
  const cards = Array.from(track.children);

  const isMobile = () => window.matchMedia('(max-width: 840px)').matches;

  if (prefersReducedMotion() || isMobile() || !window.gsap || !window.ScrollTrigger) {
    // Fall back to vertical stack (CSS handles it). Set dot active by visibility.
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
  const ST = window.ScrollTrigger;

  let scrollLength;
  function getDistance() {
    return track.scrollWidth - window.innerWidth;
  }

  const tween = gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      },
    },
  });

  // Recalculate on resize
  window.addEventListener('resize', () => ST.refresh());
}
