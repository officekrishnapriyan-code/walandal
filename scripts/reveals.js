import { prefersReducedMotion } from './utils.js';

export function initReveals() {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const gsapReady = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero title SplitText
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && typeof SplitText !== 'undefined') {
      const split = new SplitText(heroTitle, { type: 'chars' });
      gsap.from(split.chars, {
        y: '110%', opacity: 0, duration: 1.0,
        stagger: 0.018, ease: 'power4.out', delay: 0.2
      });
    }

    // H2 line reveals
    document.querySelectorAll('section h2').forEach(h2 => {
      if (h2.closest('#hero')) return;
      if (typeof SplitText !== 'undefined') {
        const split = new SplitText(h2, { type: 'lines', linesClass: 'line-wrap' });
        split.lines.forEach(line => {
          const inner = document.createElement('div');
          inner.style.overflow = 'hidden';
          line.parentNode.insertBefore(inner, line);
          inner.appendChild(line);
        });
        gsap.from(split.lines, {
          y: '110%', duration: 0.9, stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: h2, start: 'top 85%', once: true }
        });
      }
    });

    // Generic reveals
    document.querySelectorAll('.reveal').forEach(el => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    // Stagger reveals
    document.querySelectorAll('.reveal-stagger').forEach(parent => {
      gsap.from(parent.children, {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
      });
    });

    // Hero timeline
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to('.hero-eyebrow',   { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to('.hero-sub',       { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.5)
      .to('.hero-actions',   { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.8)
      .to('.hero-scroll-hint, .hero-timestamp', { opacity: 1, duration: 0.6 }, 1.2);

    // Manifesto word-by-word
    const words = document.querySelectorAll('.manifesto-statement .word');
    if (words.length) {
      gsap.to(words, {
        opacity: 1,
        stagger: { each: 0.05, from: 'start' },
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto-statement',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.5
        }
      });
    }

  } else {
    // Fallback: IntersectionObserver
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

    // Hero fallback
    document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-sub, .hero-actions, .hero-scroll-hint, .hero-timestamp')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }
}
