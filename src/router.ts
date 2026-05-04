import type { ZoneId } from './types';
import { ZONES } from './data/zones';

export type Route =
  | { kind: 'home' }
  | { kind: 'zone'; id: ZoneId }
  | { kind: 'building'; gate: string };

const listeners: Array<(r: Route) => void> = [];
let currentRoute: Route = { kind: 'home' };

export function parseHash(): Route {
  const rawHash = window.location.hash.replace(/^#/, '');
  // Strip query string (e.g. `?f=studio,pet`) — filter-state owns that slot.
  const queryStart = rawHash.indexOf('?');
  const hash = queryStart >= 0 ? rawHash.slice(0, queryStart) : rawHash;
  if (!hash || hash === '/') return { kind: 'home' };
  const parts = hash.replace(/^\//, '').split('/').filter(Boolean);
  if (parts[0] === 'zone' && parts[1]) {
    const id = parts[1] as ZoneId;
    if (ZONES.includes(id)) return { kind: 'zone', id };
  }
  if (parts[0] === 'building' && parts[1]) {
    return { kind: 'building', gate: parts[1].toUpperCase() };
  }
  return { kind: 'home' };
}

export function navigate(route: Route): void {
  const hash = serialize(route);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    fire(route);
  }
}

export function getCurrentRoute(): Route {
  return currentRoute;
}

export function onRouteChange(cb: (r: Route) => void): () => void {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function serialize(route: Route): string {
  if (route.kind === 'home') return '#/';
  if (route.kind === 'zone') return `#/zone/${route.id}`;
  return `#/building/${route.gate}`;
}

function fire(route: Route): void {
  currentRoute = route;
  listeners.forEach(cb => cb(route));
}

export function initRouter(): void {
  currentRoute = parseHash();
  window.addEventListener('hashchange', () => fire(parseHash()));
}
