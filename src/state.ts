import type { ZoneId, SortMode } from './types';

let activeZone: ZoneId = 'embarcadero';
let sortMode: SortMode = 'gate';
let expanded = new Set<string>();

export function getActiveZone(): ZoneId { return activeZone; }
export function setActiveZone(zone: ZoneId): void { activeZone = zone; }

export function getSortMode(): SortMode { return sortMode; }
export function setSortMode(mode: SortMode): void { sortMode = mode; }

export function getExpanded(): Set<string> { return expanded; }
export function toggleExpanded(gate: string): void {
  if (expanded.has(gate)) expanded.delete(gate);
  else expanded.add(gate);
}

export function initState(prefs: { sortMode: SortMode; activeZone: ZoneId; expanded: Set<string> }): void {
  sortMode = prefs.sortMode;
  activeZone = prefs.activeZone;
  expanded = prefs.expanded;
}
