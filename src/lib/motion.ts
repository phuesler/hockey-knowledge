/**
 * Animation duration that collapses to 0 when the visitor asked for reduced motion.
 * SSR-safe: returns 0 on the server, where nothing animates anyway.
 */
export function motionDuration(ms: number): number {
  if (typeof window === 'undefined') return 0;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
}
