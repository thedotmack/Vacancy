import type { ZoneId } from '../types';
import { ZONE_COLORS, NEIGHBORHOOD_PATHS, SF_CITY_OUTLINE } from '../data/map-polygons';
import { ZONE_METADATA } from '../data/zones';
import { getActiveZone } from '../state';
import { setActiveZone } from './zone-strip';

/** Look up a human-readable title for a zone ID. */
function zoneTitleForId(zoneId: string): string {
  const meta = ZONE_METADATA.find(m => m.id === zoneId);
  return meta ? meta.title : zoneId;
}

/** Called once on init — builds the SVG and inserts it into #cityMap. */
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

  const svgMarkup = `<svg viewBox="0 0 400 500" class="city-map-svg">
  <defs>
    ${patternsMarkup}
  </defs>
  <path d="${SF_CITY_OUTLINE}" class="city-outline" fill="none" stroke="rgba(255,180,0,0.15)" stroke-width="1"/>
  ${pathsMarkup}
</svg>`;

  container.innerHTML = svgMarkup;

  // Attach click handlers to each zone path
  container.querySelectorAll<SVGPathElement>('.map-zone').forEach(path => {
    path.addEventListener('click', () => {
      const zoneId = path.dataset.zone as ZoneId | undefined;
      if (zoneId) {
        setActiveZone(zoneId, true);
        updateCityMap();
      }
    });
  });

  // Set initial active/inactive state
  updateCityMap();
}

/** Called whenever the active zone changes — updates CSS classes on map paths. */
export function updateCityMap(): void {
  const activeZone = getActiveZone();
  const paths = document.querySelectorAll<SVGPathElement>('.map-zone');

  paths.forEach(path => {
    const isActive = path.dataset.zone === activeZone;
    path.classList.toggle('map-zone-active', isActive);
    path.classList.toggle('map-zone-inactive', !isActive);
  });
}
