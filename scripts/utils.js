export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouchDevice = () =>
  ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

export function lerp(a, b, t) { return a + (b - a) * t; }

export function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
