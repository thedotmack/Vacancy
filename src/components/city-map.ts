import type { ZoneId } from '../types';
import { ZONE_COLORS, NEIGHBORHOOD_PATHS, SF_CITY_OUTLINE } from '../data/map-polygons';
import { ZONE_METADATA } from '../data/zones';
import { BUILDINGS } from '../data/buildings';
import { lowestPrice } from '../utils/formatters';
import { getActiveZone } from '../state';
import { setActiveZone } from './zone-strip';

const VIEWBOX_W = 400;
const VIEWBOX_H = 500;

// Bounding box for SF lat/lng range, tuned so pin positions sit
// inside the corresponding neighborhood polygons.
const LNG_MIN = -122.515;
const LNG_MAX = -122.380;
const LAT_MAX = 37.815;
const LAT_MIN = 37.730;

const PIN_X_MIN = 12;
const PIN_X_MAX = 372;
const PIN_Y_MIN = 28;
const PIN_Y_MAX = 442;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = PIN_X_MIN + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (PIN_X_MAX - PIN_X_MIN);
  const y = PIN_Y_MIN + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (PIN_Y_MAX - PIN_Y_MIN);
  return { x: Math.max(PIN_X_MIN, Math.min(PIN_X_MAX, x)), y: Math.max(PIN_Y_MIN, Math.min(PIN_Y_MAX, y)) };
}

function priceLabel(price: number): string {
  if (!price) return '—';
  if (price >= 1000) return '$' + (price / 1000).toFixed(price % 1000 === 0 ? 0 : 1) + 'K';
  return '$' + price;
}

function zoneTitleForId(zoneId: string): string {
  const meta = ZONE_METADATA.find(m => m.id === zoneId);
  return meta ? meta.title : zoneId;
}

export function renderCityMap(): void {
  const container = document.getElementById('cityMap');
  if (!container) return;

  let patternsMarkup = '';
  let pathsMarkup = '';

  for (const [zoneId, pathData] of Object.entries(NEIGHBORHOOD_PATHS)) {
    const color = ZONE_COLORS[zoneId] ?? '#FFB400';
    const title = zoneTitleForId(zoneId);

    patternsMarkup += `<pattern id="map-dots-${zoneId}" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="${color}" />
    </pattern>\n`;

    pathsMarkup += `<path d="${pathData}" class="map-zone" data-zone="${zoneId}" fill="url(#map-dots-${zoneId})" aria-label="${title}" />\n`;
  }

  // Pins: one per building, with a small dot + price label.
  let pinsMarkup = '';
  for (const b of BUILDINGS) {
    const { x, y } = latLngToSvg(b.lat, b.lng);
    const color = ZONE_COLORS[b.zone] ?? '#FFB400';
    const label = priceLabel(lowestPrice(b));
    pinsMarkup += `<g class="map-pin" data-gate="${b.gate}" data-zone="${b.zone}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" aria-label="${b.name} ${label}">
      <circle class="map-pin-halo" r="11" fill="${color}" opacity="0.22"/>
      <circle class="map-pin-dot" r="4" fill="#0A0A0A" stroke="${color}" stroke-width="1.8"/>
      <text class="map-pin-label" x="7" y="3" font-size="13" font-weight="700" fill="${color}" stroke="#0A0A0A" stroke-width="3" paint-order="stroke">${label}</text>
    </g>\n`;
  }

  const svgMarkup = `<svg viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}" class="city-map-svg" role="img" aria-label="San Francisco map of vacancies">
  <defs>
    ${patternsMarkup}
  </defs>
  <path d="${SF_CITY_OUTLINE}" class="city-outline" fill="none" stroke="rgba(255,180,0,0.15)" stroke-width="1"/>
  ${pathsMarkup}
  <g class="map-pins">${pinsMarkup}</g>
</svg>`;

  container.innerHTML = svgMarkup;

  container.querySelectorAll<SVGPathElement>('.map-zone').forEach(path => {
    path.addEventListener('click', () => {
      const zoneId = path.dataset.zone as ZoneId | undefined;
      if (zoneId) {
        setActiveZone(zoneId, true);
        updateCityMap();
      }
    });
  });

  container.querySelectorAll<SVGGElement>('.map-pin').forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const zoneId = pin.dataset.zone as ZoneId | undefined;
      const gate = pin.dataset.gate;
      if (zoneId) {
        setActiveZone(zoneId, true);
        updateCityMap();
        if (gate) {
          // After the panel scrolls in, scroll the matching row into view.
          setTimeout(() => {
            const row = document.querySelector(`.zone-page[data-zone-id="${zoneId}"] .row[data-gate="${gate}"]`);
            if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 350);
        }
      }
    });
  });

  updateCityMap();
}

export function updateCityMap(): void {
  const activeZone = getActiveZone();

  document.querySelectorAll<SVGPathElement>('.map-zone').forEach(path => {
    const isActive = path.dataset.zone === activeZone;
    path.classList.toggle('map-zone-active', isActive);
    path.classList.toggle('map-zone-inactive', !isActive);
  });

  document.querySelectorAll<SVGGElement>('.map-pin').forEach(pin => {
    const isActive = pin.dataset.zone === activeZone;
    pin.classList.toggle('map-pin-active', isActive);
    pin.classList.toggle('map-pin-inactive', !isActive);
  });
}
