export function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  // Duplicate content for seamless loop
  track.innerHTML += track.innerHTML;
}
