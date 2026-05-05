import type { Building } from '../types';

/**
 * Build a real-photo URL for a building using a free website-screenshot
 * service (thum.io). The service renders the canonical property page (or
 * the property's Google Maps listing for buildings that don't have a
 * standalone site) into a JPG.
 *
 * If the screenshot fails to load, the caller is expected to fall back
 * to the procedural SVG art (`buildingArtSVG`) by handling `<img onerror>`.
 */
export function buildingPhotoUrl(b: Building, width = 640, height = 400): string {
  if (b.photoUrl) return b.photoUrl;
  // thum.io accepts the URL inline (not URL-encoded) at the end of the path.
  const target = b.sourceUrl;
  return `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${target}`;
}

/**
 * Static OpenStreetMap fallback photo. Used as a second-tier fallback
 * (when the screenshot service is unreachable) since it always works
 * without an API key.
 */
export function buildingMapImageUrl(b: Building, width = 640, height = 400): string {
  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${b.lat},${b.lng}` +
    `&zoom=17` +
    `&size=${width}x${height}` +
    `&maptype=mapnik` +
    `&markers=${b.lat},${b.lng},red-pushpin`
  );
}
