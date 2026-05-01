let activeZone = 'embarcadero';
let sortMode = 'gate';
let expanded = new Set();
export function getActiveZone() { return activeZone; }
export function setActiveZone(zone) { activeZone = zone; }
export function getSortMode() { return sortMode; }
export function setSortMode(mode) { sortMode = mode; }
export function getExpanded() { return expanded; }
export function toggleExpanded(gate) {
    if (expanded.has(gate))
        expanded.delete(gate);
    else
        expanded.add(gate);
}
export function initState(prefs) {
    sortMode = prefs.sortMode;
    activeZone = prefs.activeZone;
    expanded = prefs.expanded;
}
