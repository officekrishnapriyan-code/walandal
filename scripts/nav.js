export function initNav() {
  const nav      = document.querySelector('.nav');
  const progress = document.querySelector('.nav-progress');
  const toggle   = document.querySelector('.nav-toggle');
  const mobile   = document.querySelector('.nav-mobile');

  // Scroll: shrink + progress bar
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', scrolled > 80);
    if (progress) progress.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });

  // Mobile menu
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('active');
      mobile.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}
