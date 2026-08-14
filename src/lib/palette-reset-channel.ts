/**
 * A one-signal channel for "the user asked to start over".
 *
 * The navbar logo and the palette form live in separate branches of the tree,
 * with an async Server Component layout between them, so there is no common
 * client ancestor to hold this state without introducing a new client boundary.
 * This used to travel as `window.dispatchEvent(new CustomEvent("resetPaletteForm"))`
 * with a listener keyed off the same string — invisible to the type checker,
 * unreachable from tests, and silently broken by a typo on either side.
 *
 * A module-scoped subscriber set gives the same fire-and-forget shape with a
 * typed surface: the emitter and the subscriber cannot disagree about the name,
 * because there is no name.
 */
type PaletteResetListener = () => void;

const listeners = new Set<PaletteResetListener>();

/**
 * Registers a listener and returns its unsubscribe function, shaped for direct
 * use as a `useEffect` cleanup.
 */
export function onPaletteReset(listener: PaletteResetListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notifies every current subscriber.
 *
 * Iterates a copy, so a listener that subscribes or unsubscribes during the
 * notification does not disturb the pass in progress.
 */
export function requestPaletteReset(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}
