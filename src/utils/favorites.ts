/**
 * STUB — Phase 3 placeholder for Phase 2's favorites store.
 * Phase 2 will overwrite this file at merge with the full implementation.
 *
 * Contract surface that Phase 3 (the building detail overlay) consumes:
 *   - getFavorites(): Set<string>
 *   - isFavorite(gate): boolean
 *   - toggleFavorite(gate): boolean   // returns the new favorited state
 *   - onFavoritesChanged(cb): () => void   // returns an unsubscribe fn
 *
 * The stub backs everything with localStorage so that the heart toggle in
 * the detail overlay actually persists during dev / preview, even before
 * Phase 2 lands. A `favorites-changed` CustomEvent is dispatched on
 * `window` so multiple subscribers can rerender in lockstep.
 */

const STORAGE_KEY = 'sfrta:favorites';
const EVENT_NAME = 'favorites-changed';

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Storage might be unavailable (private mode, quota). The in-memory
    // listeners still fire, so the page stays in sync for the session.
  }
}

export function getFavorites(): Set<string> {
  return read();
}

export function isFavorite(gate: string): boolean {
  return read().has(gate);
}

export function toggleFavorite(gate: string): boolean {
  const set = read();
  const nowFavorited = !set.has(gate);
  if (nowFavorited) {
    set.add(gate);
  } else {
    set.delete(gate);
  }
  write(set);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { gate, favorited: nowFavorited } }));
  return nowFavorited;
}

export function onFavoritesChanged(cb: () => void): () => void {
  const handler = (): void => cb();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
