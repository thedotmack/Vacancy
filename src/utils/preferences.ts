import type { ZoneId, SortMode } from '../types';
import { SORT_MODES, ZONES } from '../data/zones';

const PREFS_KEY = 'sfrta_prefs_v2';

interface StoredPreferences {
  sortMode: SortMode;
  activeZone: ZoneId;
  expanded: string[];
}

export function savePreferences(sortMode: SortMode, activeZone: ZoneId, expanded: Set<string>): void {
  try {
    const data: StoredPreferences = { sortMode, activeZone, expanded: [...expanded] };
    localStorage.setItem(PREFS_KEY, JSON.stringify(data));
  } catch (_) { /* localStorage unavailable */ }
}

export function loadPreferences(): { sortMode: SortMode; activeZone: ZoneId; expanded: Set<string> } {
  const defaults = { sortMode: 'gate' as SortMode, activeZone: 'embarcadero' as ZoneId, expanded: new Set<string>() };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      sortMode: parsed.sortMode && SORT_MODES.includes(parsed.sortMode) ? parsed.sortMode : defaults.sortMode,
      activeZone: parsed.activeZone && ZONES.includes(parsed.activeZone) ? parsed.activeZone : defaults.activeZone,
      expanded: Array.isArray(parsed.expanded) ? new Set(parsed.expanded) : defaults.expanded,
    };
  } catch (_) {
    return defaults;
  }
}
