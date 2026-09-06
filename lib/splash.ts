// lib/splash.ts
// Timings and the hand-off between the splash screen and the landing page's
// entrance animation, which must not play while the splash is still covering
// it.

/** How long the logo is held on screen before the zoom begins. */
export const SPLASH_HOLD_MS = 3000;

/** The zoom itself, after the hold. */
export const SPLASH_ZOOM_MS = 800;

const EVENT = "ruangpijar:splash-done";

// Module scope, so both the splash and the animation driver read the same
// value from the same client bundle.
let finished = false;

export function markSplashDone() {
  if (finished) return;

  finished = true;
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Calls `callback` once the splash has lifted, or straight away if it already
 * has.
 *
 * That second case is the point of the `finished` flag rather than a bare
 * listener: nothing orders the splash finishing against a subscriber mounting,
 * and a subscriber that arrived late would otherwise wait for an event that
 * had already fired.
 *
 * Returns an unsubscribe function.
 */
export function onSplashDone(callback: () => void): () => void {
  if (finished) {
    callback();
    return () => {};
  }

  window.addEventListener(EVENT, callback, { once: true });
  return () => window.removeEventListener(EVENT, callback);
}
