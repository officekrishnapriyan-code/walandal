import { prefersReducedMotion } from './utils.js';

export function initSystemsPin() {
  if (prefersReducedMotion()) return;
  if (window.innerWidth <= 840) return;

  const wrap  = document.querySelector('.systems-pin-wrap');
  const track = document.querySelector('.systems-track');
  const dots  = document.querySelectorAll('.systems-dot');
  if (!wrap || !track) return;

  const cards     = track.querySelectorAll('.system-card');
  const cardCount = cards.length;

  // Set wrap height = 4 * 100vh
  wrap.style.height = (cardCount * 100) + 'vh';

  if (typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const tween = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 2),
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: '.systems-sticky',
      onUpdate: (self) => {
        const idx = Math.round(self.progress * (cardCount - 1));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }
    }
  });
}
