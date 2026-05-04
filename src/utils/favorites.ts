/**
 * Favorites — saved building gates persisted in localStorage,
 * shared between zone overview cards and the building detail overlay.
 *
 * Storage format: JSON array of gate strings under `sfrta_favorites`.
 * Change events are dispatched on `window` as `favorites-changed` so any
 * subscribed component can re-render heart state.
 */

const STORAGE_KEY = 'sfrta_favorites';
const EVENT_NAME = 'favorites-changed';

function readFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch (_) {
    return new Set<string>();
  }
}

function writeToStorage(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch (_) {
    /* localStorage unavailable */
  }
}

let cache: Set<string> | null = null;

function getCache(): Set<string> {
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function getFavorites(): Set<string> {
  // Defensive copy — callers shouldn't mutate the cache directly.
  return new Set(getCache());
}

export function isFavorite(gate: string): boolean {
  return getCache().has(gate);
}

/**
 * Toggle the favorite state for a gate. Returns the new state
 * (true = now a favorite, false = removed). Persists and fires
 * `favorites-changed`.
 */
export function toggleFavorite(gate: string): boolean {
  const set = getCache();
  let nextState: boolean;
  if (set.has(gate)) {
    set.delete(gate);
    nextState = false;
  } else {
    set.add(gate);
    nextState = true;
  }
  writeToStorage(set);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { gate, isFavorite: nextState } }));
  return nextState;
}

/**
 * Subscribe to favorites changes. Returns an unsubscribe function.
 */
export function onFavoritesChanged(cb: () => void): () => void {
  const handler = (): void => cb();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
