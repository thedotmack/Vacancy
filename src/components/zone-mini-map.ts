import type { ZoneId } from '../types';
import { BUILDINGS } from '../data/buildings';
import { ZONE_METADATA } from '../data/zones';

/**
 * Embedded mini-map cropped to one zone's buildings.
 *
 * Cyan dot-grid background. Buildings rendered as circular pins; pins for
 * buildings with active perks (`b.perks.length > 0`) are bordered in
 * magenta. The viewBox is the buildings' bounding box plus ~250m of padding.
 *
 * Lat/lng -> SVG projection is local to this module so the city map can
 * stay independent. Roughly equirectangular, fine at neighborhood scale.
 */

const SVG_W = 320;
const SVG_H = 200;

// ~250m in lat/lng at SF latitude. 1 degree latitude ~ 111km, so 250m ~ 0.00225 deg.
// 1 degree longitude at lat 37.77 ~ 87.6km, so 250m ~ 0.00285 deg.
const PADDING_LAT = 0.0035;
const PADDING_LNG = 0.0042;

interface BBox {
  minLat: number; maxLat: number;
  minLng: number; maxLng: number;
}

function bboxFor(zoneId: ZoneId): BBox | null {
  const list = BUILDINGS.filter(b => b.zone === zoneId);
  if (list.length === 0) return null;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const b of list) {
    if (b.lat < minLat) minLat = b.lat;
    if (b.lat > maxLat) maxLat = b.lat;
    if (b.lng < minLng) minLng = b.lng;
    if (b.lng > maxLng) maxLng = b.lng;
  }
  // Always pad so single-building zones have visible context.
  return {
    minLat: minLat - PADDING_LAT,
    maxLat: maxLat + PADDING_LAT,
    minLng: minLng - PADDING_LNG,
    maxLng: maxLng + PADDING_LNG,
  };
}

function projectorFor(bbox: BBox): (lat: number, lng: number) => { x: number; y: number } {
  const lngRange = bbox.maxLng - bbox.minLng;
  const latRange = bbox.maxLat - bbox.minLat;
  return (lat, lng) => {
    const x = ((lng - bbox.minLng) / lngRange) * SVG_W;
    const y = ((bbox.maxLat - lat) / latRange) * SVG_H;
    return { x, y };
  };
}

export function renderZoneMiniMap(zoneId: ZoneId): string {
  const bbox = bboxFor(zoneId);
  if (!bbox) {
    return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" class="zone-mini-map-svg" aria-label="Empty zone map"></svg>`;
  }
  const project = projectorFor(bbox);
  const meta = ZONE_METADATA.find(z => z.id === zoneId);
  const tint = meta?.color ?? '#2EB6FF';
  const list = BUILDINGS.filter(b => b.zone === zoneId);

  // Pins
  let pinsMarkup = '';
  for (const b of list) {
    const { x, y } = project(b.lat, b.lng);
    const hasPerk = b.perks && b.perks.length > 0;
    const stroke = hasPerk ? '#FF4D9F' : '#2EB6FF';
    const haloColor = hasPerk ? '#FF4D9F' : '#2EB6FF';
    pinsMarkup += `
      <g class="zone-mini-pin" data-gate="${b.gate}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${haloColor}" opacity="0.18"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="#000000" stroke="${stroke}" stroke-width="2"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${stroke}"/>
      </g>`;
  }

  // Optional zone label in a corner (no street vector data here, so we keep it minimal)
  const labelMarkup = meta
    ? `<text x="${SVG_W - 12}" y="${SVG_H - 14}" text-anchor="end" font-size="10" font-weight="700" fill="${tint}" opacity="0.85" letter-spacing="2" font-family="'Space Mono', monospace">${meta.title}</text>`
    : '';

  // Background dot grid + an abstract street grid for visual texture.
  const gridLines: string[] = [];
  // Horizontal grid lines
  for (let i = 1; i < 6; i++) {
    const y = (SVG_H / 6) * i;
    gridLines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${SVG_W}" y2="${y.toFixed(1)}" stroke="${tint}" stroke-width="1" opacity="0.14"/>`);
  }
  for (let i = 1; i < 8; i++) {
    const x = (SVG_W / 8) * i;
    gridLines.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${SVG_H}" stroke="${tint}" stroke-width="1" opacity="0.14"/>`);
  }

  return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" class="zone-mini-map-svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${meta ? meta.title : zoneId} map">
    <defs>
      <pattern id="mm-dots-${zoneId}" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.7" fill="${tint}" opacity="0.32"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="${SVG_W}" height="${SVG_H}" fill="#01060D"/>
    <rect x="0" y="0" width="${SVG_W}" height="${SVG_H}" fill="url(#mm-dots-${zoneId})"/>
    ${gridLines.join('\n')}
    ${pinsMarkup}
    ${labelMarkup}
  </svg>`;
}
