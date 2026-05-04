import type { Building } from '../types';

/**
 * Filter state — persisted in the URL hash query string so filters survive
 * reloads and are shareable. Example: `#/zone/missionbay?f=studio,pet`.
 *
 * The filter set is global across zones (not per-zone), matching the mockup
 * where filter pills are part of the persistent zone overview chrome.
 */

export type FilterKey = 'studio' | 'pet' | 'promo';

const ALL_KEYS: FilterKey[] = ['studio', 'pet', 'promo'];

const EVENT_NAME = 'filters-changed';

function parseFilterQuery(): Set<FilterKey> {
  const hash = window.location.hash.replace(/^#/, '');
  const queryStart = hash.indexOf('?');
  if (queryStart < 0) return new Set();
  const query = hash.slice(queryStart + 1);
  const params = new URLSearchParams(query);
  const f = params.get('f');
  if (!f) return new Set();
  const out = new Set<FilterKey>();
  f.split(',').forEach(k => {
    if (ALL_KEYS.includes(k as FilterKey)) out.add(k as FilterKey);
  });
  return out;
}

function writeFilterQuery(filters: Set<FilterKey>): void {
  const hash = window.location.hash.replace(/^#/, '');
  const queryStart = hash.indexOf('?');
  const path = queryStart >= 0 ? hash.slice(0, queryStart) : hash;
  const existingQuery = queryStart >= 0 ? hash.slice(queryStart + 1) : '';
  const params = new URLSearchParams(existingQuery);
  if (filters.size === 0) {
    params.delete('f');
  } else {
    // Preserve a stable order so the URL doesn't churn.
    const ordered = ALL_KEYS.filter(k => filters.has(k));
    params.set('f', ordered.join(','));
  }
  const queryStr = params.toString();
  const nextHash = queryStr ? `#${path}?${queryStr}` : `#${path}`;
  if (window.location.hash !== nextHash) {
    // Use replaceState so we don't pollute browser history with each toggle.
    window.history.replaceState(null, '', window.location.pathname + window.location.search + nextHash);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function getActiveFilters(): Set<FilterKey> {
  return parseFilterQuery();
}

export function toggleFilter(key: FilterKey): void {
  const current = parseFilterQuery();
  if (current.has(key)) current.delete(key);
  else current.add(key);
  writeFilterQuery(current);
}

export function filterBuildings(list: Building[], filters: Set<FilterKey>): Building[] {
  if (filters.size === 0) return list;
  return list.filter(b => {
    if (filters.has('studio') && !(b.studio !== null && b.studio > 0)) return false;
    if (filters.has('pet') && !(b.amenities && b.amenities.includes('pet'))) return false;
    if (filters.has('promo') && !(b.perks && b.perks.length > 0)) return false;
    return true;
  });
}

/**
 * Subscribe to filter changes. Listens to both our internal event
 * (which fires on programmatic toggles) and the browser's `hashchange`
 * (which fires when a user navigates back/forward). Returns unsubscribe.
 */
export function onFiltersChanged(cb: () => void): () => void {
  const handler = (): void => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('hashchange', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('hashchange', handler);
  };
}
