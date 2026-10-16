// Run looping scene animations only while they are on screen, so the page
// isn't painting a dozen off-screen loops while you scroll.
export function initMotion() {
  const scenes = document.querySelectorAll('[data-anim]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-playing', e.isIntersecting));
    }, { rootMargin: '80px' });
    scenes.forEach((el) => io.observe(el));
  } else {
    scenes.forEach((el) => el.classList.add('is-playing'));
  }

  // The framework pulse travels the full width of the method line.
  const method = document.querySelector('.fw__method');
  if (method) {
    const size = () => method.style.setProperty('--fw-w', `${method.clientWidth}px`);
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(method);
  }
}
