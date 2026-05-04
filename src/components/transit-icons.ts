import type { TransitStop } from '../types';

/**
 * Tiny ~16x16 transit-mode badges used on the building detail's
 * neighborhood transit list. Each is a self-contained SVG string —
 * stroke + fill colors are baked in (the modes have brand colors).
 */

const CYAN = '#2EB6FF';
const CYAN_BRIGHT = '#6FD4FF';
const MAGENTA = '#FF4D9F';

const stickFigure = `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="3.5" r="1.6" fill="none" stroke="${CYAN_BRIGHT}" stroke-width="1.2"/>
    <line x1="8" y1="5.4" x2="8" y2="10" stroke="${CYAN_BRIGHT}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8" y1="7" x2="5.5" y2="9" stroke="${CYAN_BRIGHT}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8" y1="7" x2="10.5" y2="9" stroke="${CYAN_BRIGHT}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8" y1="10" x2="5.5" y2="13.5" stroke="${CYAN_BRIGHT}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8" y1="10" x2="10.5" y2="13.5" stroke="${CYAN_BRIGHT}" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
`;

const muniBadge = `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
    <text x="8" y="11.2" text-anchor="middle" font-family="'Doto','Space Mono',monospace" font-size="8" font-weight="700" fill="${CYAN_BRIGHT}">M</text>
  </svg>
`;

const bartBadge = `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
    <text x="8" y="11.2" text-anchor="middle" font-family="'Doto','Space Mono',monospace" font-size="8" font-weight="700" fill="${CYAN_BRIGHT}">B</text>
  </svg>
`;

const caltrainBadge = `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="10" height="9" rx="1.5" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
    <line x1="3" y1="9" x2="13" y2="9" stroke="${CYAN}" stroke-width="1"/>
    <circle cx="5.5" cy="11" r="0.9" fill="${CYAN_BRIGHT}"/>
    <circle cx="10.5" cy="11" r="0.9" fill="${CYAN_BRIGHT}"/>
    <line x1="2" y1="14" x2="6" y2="14" stroke="${CYAN_BRIGHT}" stroke-width="0.8"/>
    <line x1="10" y1="14" x2="14" y2="14" stroke="${CYAN_BRIGHT}" stroke-width="0.8"/>
  </svg>
`;

const tthirdBadge = `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="none" stroke="${MAGENTA}" stroke-width="1.2"/>
    <text x="8" y="11.2" text-anchor="middle" font-family="'Doto','Space Mono',monospace" font-size="8" font-weight="700" fill="${MAGENTA}">T</text>
  </svg>
`;

export const TRANSIT_ICON: Record<TransitStop['mode'], string> = {
  walk: stickFigure,
  muni: muniBadge,
  bart: bartBadge,
  caltrain: caltrainBadge,
  tthird: tthirdBadge,
};
