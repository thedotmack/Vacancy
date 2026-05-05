import type { Building } from '../types';

/**
 * Real-photo URL helper.
 *
 * Browsers (not this build server) ultimately fetch these URLs, so we use
 * services that surface the property's actual hero photo client-side:
 *
 *   1. b.photoUrl              — explicit override curated in BUILDINGS data
 *   2. Microlink og:image      — pulls the canonical og:image off the page
 *                                (works for almost all property websites
 *                                because they advertise an exterior photo
 *                                via OpenGraph). CDN-cached redirect.
 *   3. thum.io screenshot      — last-resort full-page screenshot when
 *                                Microlink can't extract an og:image.
 *   4. Procedural SVG art      — final visual fallback, handled by the
 *                                caller's `<img onerror>` logic.
 *
 * The chain is encoded into the markup so the user's browser walks it
 * automatically without us round-tripping per building.
 */

export function buildingPhotoPrimary(b: Building): string {
  if (b.photoUrl) return b.photoUrl;
  // Microlink free tier: extracts the og:image and 302-redirects to it.
  // No key needed; cached on Microlink's CDN.
  const target = encodeURIComponent(b.sourceUrl);
  return `https://api.microlink.io/?url=${target}&meta=false&embed=image.url`;
}

export function buildingPhotoFallback(b: Building, width = 800, height = 500): string {
  // thum.io free tier: takes a screenshot of the page. No key, generous
  // rate limit, but a small watermark can appear.
  return `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${b.sourceUrl}`;
}

/**
 * Backwards-compat alias used by the existing card grid. Returns the
 * primary URL — the caller is expected to wire `onerror` to walk the
 * fallback chain via `data-fallback` / `data-fallback-2` attributes.
 */
export function buildingPhotoUrl(b: Building, width = 800, height = 500): string {
  // (width/height are passed for parity with old callers; the primary
  // service ignores them and the browser cover-fits the result.)
  void width; void height;
  return buildingPhotoPrimary(b);
}
