import { SORT_MODES, ZONES } from '../data/zones';
const PREFS_KEY = 'sfrta_prefs_v2';
export function savePreferences(sortMode, activeZone, expanded) {
    try {
        const data = { sortMode, activeZone, expanded: [...expanded] };
        localStorage.setItem(PREFS_KEY, JSON.stringify(data));
    }
    catch (_) { /* localStorage unavailable */ }
}
export function loadPreferences() {
    const defaults = { sortMode: 'gate', activeZone: 'embarcadero', expanded: new Set() };
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (!raw)
            return defaults;
        const parsed = JSON.parse(raw);
        return {
            sortMode: parsed.sortMode && SORT_MODES.includes(parsed.sortMode) ? parsed.sortMode : defaults.sortMode,
            activeZone: parsed.activeZone && ZONES.includes(parsed.activeZone) ? parsed.activeZone : defaults.activeZone,
            expanded: Array.isArray(parsed.expanded) ? new Set(parsed.expanded) : defaults.expanded,
        };
    }
    catch (_) {
        return defaults;
    }
}
