import type { Building, AmenityKey, TransitStop } from '../types';
import { buildingArtSVG } from './building-art';
import { isFavorite } from '../utils/favorites';
import { lowestPrice } from '../utils/formatters';

/**
 * Rich building card — replaces the old expandable departure-board row.
 *
 * Layout (top-to-bottom):
 *   - figure.card-art   : procedural dot-matrix building silhouette
 *   - header.card-head  : building name + first-perk magenta badge
 *   - p.card-tag        : building.tagline
 *   - div.card-price    : "From $X" + "{avail} units"
 *   - div.card-amenities: first 3 amenity icons + "+N" overflow chip
 *   - div.card-walk     : transit icon + "{mins} min to {name}"
 *   - div.card-actions  : "VIEW BUILDING" link (#/building/{gate}) + "TOUR" link
 *
 * Tap on the card art or title also routes to the building detail.
 */

// Fallback amenity icons. Phase 3 ships a more complete set in
// `amenity-icons.ts`; if that lands first we'll DRY this up in Phase 4.
// For each key we render a minimal 14x14 SVG glyph using currentColor.
const FALLBACK_AMENITY_ICON: Record<string, string> = {
  rooftop: '<svg viewBox="0 0 24 24"><path d="M3 14l9-7 9 7v7H3z"/><line x1="3" y1="14" x2="21" y2="14"/></svg>',
  gym: '<svg viewBox="0 0 24 24"><line x1="2" y1="12" x2="22" y2="12"/><rect x="4" y="8" width="3" height="8"/><rect x="17" y="8" width="3" height="8"/><rect x="8" y="10" width="8" height="4"/></svg>',
  coworking: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="11" rx="1"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/></svg>',
  pet: '<svg viewBox="0 0 24 24"><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="9" cy="5" r="1.7"/><circle cx="15" cy="5" r="1.7"/><path d="M12 11c-3 0-6 3-6 6 0 2 2 3 4 3 1 0 1.5-1 2-1s1 1 2 1c2 0 4-1 4-3 0-3-3-6-6-6z"/></svg>',
  bike: '<svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><line x1="6" y1="17" x2="11" y2="9"/><line x1="11" y1="9" x2="18" y2="17"/><line x1="11" y1="9" x2="16" y2="9"/></svg>',
  pool: '<svg viewBox="0 0 24 24"><path d="M2 17q3-2 5 0t5 0t5 0t5 0"/><path d="M2 21q3-2 5 0t5 0t5 0t5 0"/><line x1="7" y1="6" x2="7" y2="14"/><line x1="17" y1="6" x2="17" y2="14"/></svg>',
  parking: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>',
  doorman: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/></svg>',
  laundry: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><circle cx="8" cy="6.5" r="0.6"/><circle cx="11" cy="6.5" r="0.6"/></svg>',
  concierge: '<svg viewBox="0 0 24 24"><path d="M5 11a7 7 0 0 1 14 0v3H5z"/><line x1="5" y1="14" x2="19" y2="14"/><circle cx="12" cy="4" r="1.5"/></svg>',
  spa: '<svg viewBox="0 0 24 24"><path d="M12 4c2 4 6 6 6 10s-3 6-6 6-6-2-6-6 4-6 6-10z"/><path d="M12 12v8"/></svg>',
  sauna: '<svg viewBox="0 0 24 24"><path d="M6 16c2-2 2-4 0-6"/><path d="M12 16c2-2 2-4 0-6"/><path d="M18 16c2-2 2-4 0-6"/><line x1="3" y1="20" x2="21" y2="20"/></svg>',
  theater: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="11" rx="1"/><line x1="3" y1="20" x2="21" y2="20"/><line x1="8" y1="16" x2="6" y2="20"/><line x1="16" y1="16" x2="18" y2="20"/></svg>',
  dogwash: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M8 14a4 4 0 0 1 8 0v3H8z"/><path d="M5 19q2-1 4 0t4 0t4 0t4 0"/></svg>',
  lounge: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="6" rx="1"/><rect x="3" y="9" width="3" height="2"/><rect x="18" y="9" width="3" height="2"/><line x1="6" y1="17" x2="6" y2="20"/><line x1="18" y1="17" x2="18" y2="20"/></svg>',
  deck: '<svg viewBox="0 0 24 24"><line x1="3" y1="14" x2="21" y2="14"/><rect x="6" y="14" width="3" height="7"/><rect x="11" y="14" width="3" height="7"/><rect x="16" y="14" width="3" height="7"/><path d="M3 8h18l-3 6H6z"/></svg>',
};

const AMENITY_LABEL: Record<string, string> = {
  rooftop: 'ROOFTOP', gym: 'GYM', coworking: 'CO-WORKING', pet: 'PET FRIENDLY',
  bike: 'BIKE STORAGE', pool: 'POOL', parking: 'PARKING', doorman: 'DOORMAN',
  laundry: 'LAUNDRY', concierge: 'CONCIERGE', spa: 'SPA', sauna: 'SAUNA',
  theater: 'THEATER', dogwash: 'DOG WASH', lounge: 'LOUNGE', deck: 'DECK',
};

const TRANSIT_GLYPH: Record<TransitStop['mode'], { letter: string; color: string }> = {
  walk:     { letter: 'W', color: '#6FD4FF' },
  muni:     { letter: 'M', color: '#FF4D9F' },
  bart:     { letter: 'B', color: '#FFD54F' },
  caltrain: { letter: 'C', color: '#4ADE80' },
  tthird:   { letter: 'T', color: '#FF4D9F' },
};

function transitGlyph(stop: TransitStop): string {
  const { letter, color } = TRANSIT_GLYPH[stop.mode] ?? { letter: '·', color: '#6FD4FF' };
  return `<svg viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="7" r="6.2" fill="none" stroke="${color}" stroke-width="1.4"/>
    <text x="7" y="9.4" text-anchor="middle" font-family="'Space Mono', monospace" font-size="7" font-weight="700" fill="${color}">${letter}</text>
  </svg>`;
}

function renderAmenity(key: AmenityKey): string {
  const svg = FALLBACK_AMENITY_ICON[key]
    ?? '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>';
  const label = AMENITY_LABEL[key] ?? key.toUpperCase();
  return `<div class="card-amenity-chip" aria-label="${label}" title="${label}">
    <span class="card-amenity-icon">${svg}</span>
    <span class="card-amenity-label">${label}</span>
  </div>`;
}

function fromPriceLabel(price: number): string {
  if (!price) return '—';
  return '$' + price.toLocaleString();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function chooseTransit(b: Building): TransitStop | null {
  if (!b.transit || b.transit.length === 0) return null;
  // Prefer the shortest non-walk stop; fall back to any.
  const sorted = [...b.transit].sort((a, c) => a.mins - c.mins);
  const nonWalk = sorted.find(s => s.mode !== 'walk');
  return nonWalk ?? sorted[0];
}

export function renderBuildingCard(b: Building, zoneTint: string): string {
  const lowest = lowestPrice(b);
  const firstPerk = b.perks && b.perks[0];
  const tagline = b.tagline || b.notes.split('.')[0];
  const detailHref = `#/building/${b.gate}`;
  const tourHref = (b.tourUrl && /^https?:\/\//.test(b.tourUrl)) ? b.tourUrl : b.sourceUrl;
  const hasTour = tourHref && /^https?:\/\//.test(tourHref);
  const fav = isFavorite(b.gate);

  const amenities = b.amenities || [];
  const visibleAmenities = amenities.slice(0, 3);
  const overflowCount = Math.max(0, amenities.length - visibleAmenities.length);

  const transit = chooseTransit(b);

  return `
    <article class="building-card" data-gate="${b.gate}" style="--zone-tint:${zoneTint}">
      <a class="card-art-link" href="${detailHref}" aria-label="${escapeHtml(b.name)} details">
        <figure class="card-art">${buildingArtSVG(b, zoneTint, { variant: 'card' })}</figure>
      </a>
      <div class="card-body">
        <header class="card-head">
          <a class="card-title-link" href="${detailHref}">
            <h3 class="card-title">${escapeHtml(b.name)}</h3>
          </a>
          <button class="card-fav ${fav ? 'is-active' : ''}" type="button"
                  data-card-fav="${b.gate}"
                  aria-pressed="${fav}"
                  aria-label="${fav ? 'Remove from favorites' : 'Save building'}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          ${firstPerk ? `<span class="card-perk-badge"><span class="card-perk-icon">&#127873;</span>${escapeHtml(firstPerk)}</span>` : ''}
        </header>
        <p class="card-tag">${escapeHtml(tagline)}</p>
        <div class="card-price">
          <div class="card-price-block">
            <span class="card-price-from">From</span>
            <span class="card-price-value">${fromPriceLabel(lowest)}</span>
          </div>
          <div class="card-units">${b.avail} units</div>
        </div>
        ${visibleAmenities.length > 0 ? `<div class="card-amenities">
          ${visibleAmenities.map(renderAmenity).join('')}
          ${overflowCount > 0 ? `<div class="card-amenity-more" aria-label="${overflowCount} more amenities">+${overflowCount}</div>` : ''}
        </div>` : ''}
        ${transit ? `<div class="card-walk">
          <span class="card-walk-icon">${transitGlyph(transit)}</span>
          <span class="card-walk-text">${transit.mins} min to ${escapeHtml(transit.name)}</span>
        </div>` : ''}
        <div class="card-actions">
          <a class="card-cta view-building" href="${detailHref}">
            <span>VIEW BUILDING</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </a>
          ${hasTour ? `<a class="card-cta tour" href="${tourHref}" target="_blank" rel="noopener">
            <span>TOUR</span>
          </a>` : ''}
        </div>
      </div>
    </article>
  `;
}
