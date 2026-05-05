import '../styles/building-detail.css';
import type { Building, AmenityKey, TransitStop } from '../types';
import { BUILDINGS } from '../data/buildings';
import { ZONE_METADATA } from '../data/zones';
import { buildingArtSVG } from './building-art';
import { AMENITY_ICON, AMENITY_LABEL } from './amenity-icons';
import { TRANSIT_ICON } from './transit-icons';
import { formatMoveIn, formatChipDate } from '../utils/dates';
import { formatPrice, lowestPrice } from '../utils/formatters';
import { isFavorite, toggleFavorite, onFavoritesChanged } from '../utils/favorites';
import { fetchAllVoteCounts } from '../utils/feedback-api';
import { buildingPhotoUrl } from '../utils/photos';

let unsubscribeFavorites: (() => void) | null = null;
let toastTimer: number | null = null;

export function mountBuildingDetail(gate: string): void {
  const building = BUILDINGS.find(b => b.gate.toUpperCase() === gate.toUpperCase());
  if (!building) {
    console.warn(`[building-detail] no building for gate ${gate}`);
    return;
  }

  const root = ensureRoot();
  root.innerHTML = renderDetail(building);
  root.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    root.classList.add('is-open');
  });

  wireEvents(root, building);

  if (unsubscribeFavorites) unsubscribeFavorites();
  unsubscribeFavorites = onFavoritesChanged(() => paintHearts(root, building.gate));
  paintHearts(root, building.gate);

  fetchAllVoteCounts().then(counts => {
    const v = counts[building.gate];
    if (!v) return;
    const el = root.querySelector<HTMLElement>(`.row[data-gate="${building.gate}"] .accuracy-count`);
    if (el) el.textContent = `${v.yes} ✓ · ${v.no} ✗`;
  }).catch(() => {
    // Vote count fetch failure is non-fatal.
  });
}

export function unmountBuildingDetail(): void {
  const root = document.getElementById('buildingDetailRoot');
  if (!root) return;
  root.classList.remove('is-open');
  root.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    if (!root.classList.contains('is-open')) {
      root.innerHTML = '';
    }
  }, 320);

  if (unsubscribeFavorites) {
    unsubscribeFavorites();
    unsubscribeFavorites = null;
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function ensureRoot(): HTMLElement {
  let root = document.getElementById('buildingDetailRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'buildingDetailRoot';
    root.setAttribute('aria-hidden', 'true');
    document.body.appendChild(root);
  }
  return root;
}

function renderDetail(b: Building): string {
  const zoneMeta = ZONE_METADATA.find(m => m.id === b.zone);
  const zoneTint = zoneMeta?.color ?? '#0a66c2';
  const zoneTitle = zoneMeta?.title ?? b.zone.toUpperCase();
  const leasedPct = b.leasedPct ?? 90;
  const minPrice = lowestPrice(b);
  const minBed = bedRangeLabel(b);
  const fav = isFavorite(b.gate);

  const perks = (b.perks ?? []).slice(0, 3);
  const amenities = b.amenities ?? [];
  const tiles = amenityTiles(amenities);
  const next = b.nextAvailable ?? [];
  const earliest = next[0] ?? null;
  const transit = b.transit ?? [];

  const tourTarget = b.tourUrl || b.sourceUrl;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
  const phoneHref = `tel:${b.phone}`;
  const photoSrc = buildingPhotoUrl(b, 1024, 520);
  const fallbackArt = buildingArtSVG(b, zoneTint, { variant: 'hero' });

  return `
    <section class="detail-overlay" role="dialog" aria-modal="true" aria-label="${escapeAttr(b.name)} details">
      <header class="detail-app-bar">
        <button class="detail-back" type="button" aria-label="Back">${CHEVRON_LEFT}</button>
        <span class="detail-app-bar-title">${escapeHtml(b.name)}</span>
        <div class="detail-app-bar-actions">
          <button class="detail-share" type="button" aria-label="Share">${SHARE_ICON}</button>
          <button class="detail-heart" type="button" aria-label="Favorite" data-favorited="${fav ? 'true' : 'false'}">${HEART_FILL_ICON}</button>
        </div>
      </header>

      <figure class="detail-hero">
        <span class="hero-zone-badge">${escapeHtml(zoneTitle)}</span>
        <img src="${escapeAttr(photoSrc)}" alt="${escapeAttr(b.name)} exterior" loading="eager" referrerpolicy="no-referrer"
             onerror="this.outerHTML=this.dataset.fallback"
             data-fallback="${escapeAttr(fallbackArt)}">
        <span class="hero-leased-badge">${leasedPct}% leased</span>
      </figure>

      <div class="detail-title-block">
        <h1 class="detail-title">${escapeHtml(b.name)}</h1>
        <p class="detail-loc">
          ${PIN_ICON_INLINE}
          <span>${escapeHtml(b.address)}, San Francisco</span>
        </p>
        ${b.tagline ? `<p class="detail-tagline">${escapeHtml(b.tagline)}</p>` : ''}
      </div>

      ${perks.length > 0 ? `
        <div class="perks-row">
          ${perks.map(p => `<span class="perk-pill">${escapeHtml(p)}</span>`).join('')}
        </div>
      ` : ''}

      <section class="stats-grid" aria-label="Key stats">
        <div class="stat-cell-large">
          <span class="stat-cell-label">Starting at</span>
          <span class="stat-cell-value">${formatPrice(minPrice)}<span class="stat-cell-unit">/mo</span></span>
          <span class="stat-cell-sub">${escapeHtml(minBed)}</span>
        </div>
        <div class="stat-cell">
          <span class="stat-cell-icon">${FLOOR_PLANS_ICON}</span>
          <span class="stat-cell-value-sm">${b.floorPlans ?? '—'}</span>
          <span class="stat-cell-label">Floor plans</span>
        </div>
        <div class="stat-cell">
          <span class="stat-cell-icon">${UNITS_ICON}</span>
          <span class="stat-cell-value-sm">${b.avail}</span>
          <span class="stat-cell-label">Available</span>
        </div>
        <div class="stat-cell">
          <span class="stat-cell-icon">${CALENDAR_ICON}</span>
          <span class="stat-cell-value-sm">${earliest ? formatMoveIn(earliest) : '—'}</span>
          <span class="stat-cell-label">Move-in</span>
        </div>
      </section>

      ${amenities.length > 0 ? `
        <section class="detail-section" aria-label="Amenities">
          <h2 class="detail-section-title">Amenities</h2>
          <div class="amenities-grid">${tiles}</div>
        </section>
      ` : ''}

      <section class="detail-section" aria-label="Tour your way">
        <h2 class="detail-section-title">Tour your way</h2>
        <a class="tour-card" href="${escapeAttr(tourTarget)}" target="_blank" rel="noopener">
          <span class="tour-card-icon">${PEOPLE_ICON}</span>
          <span class="tour-card-text">
            <strong>In-person tour</strong>
            <span>See it in person with the leasing team</span>
          </span>
          <span class="tour-card-chevron">${CHEVRON_RIGHT}</span>
        </a>
        <a class="tour-card" href="${escapeAttr(tourTarget)}" target="_blank" rel="noopener">
          <span class="tour-card-icon">${LAPTOP_ICON}</span>
          <span class="tour-card-text">
            <strong>Virtual tour</strong>
            <span>Live walkthrough from your device</span>
          </span>
          <span class="tour-card-chevron">${CHEVRON_RIGHT}</span>
        </a>
      </section>

      ${next.length > 0 ? `
        <section class="next-avail-row" aria-label="Next available">
          <h2 class="detail-section-title" style="margin-bottom:8px">Next available</h2>
          <div class="next-avail-chips">
            ${next.slice(0, 3).map(d => `<span class="chip">${formatChipDate(d)}</span>`).join('')}
          </div>
        </section>
      ` : ''}

      <section class="neighborhood" aria-label="Neighborhood">
        <h2 class="neighborhood-title">Neighborhood</h2>
        <div class="detail-mini-map">${renderMiniMap(b, zoneTint)}</div>
        <div class="zone-label-row">
          <span class="zone-label-name">${escapeHtml(zoneTitle)}</span>
          <span class="zone-label-sub">San Francisco</span>
        </div>
        ${transit.length > 0 ? `
          <ul class="transit-list">
            ${transit.map(t => transitListItem(t)).join('')}
          </ul>
        ` : ''}
        <a class="directions-link" href="${escapeAttr(directionsUrl)}" target="_blank" rel="noopener">Get directions</a>
      </section>

      <section class="detail-info-3col" aria-label="Property info">
        <div class="info-cell">
          <span class="info-cell-icon">${CALENDAR_ICON}</span>
          <strong>Move-in</strong>
          <span>Flexible</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">${FLOOR_PLANS_ICON}</span>
          <strong>Floor plans</strong>
          <span>${b.floorPlans ?? '—'} layouts</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">${PHONE_ICON_INLINE}</span>
          <strong>Office</strong>
          <span>Mon–Sun · 9–8</span>
          <a class="info-cell-phone" href="${escapeAttr(phoneHref)}">${escapeHtml(formatPhone(b.phone))}</a>
        </div>
      </section>

      <section class="detail-feedback">
        <div class="row" data-gate="${escapeAttr(b.gate)}" style="display:contents">
          <div class="accuracy-section">
            <span class="accuracy-label">Is this accurate?</span>
            <button class="accuracy-btn accuracy-yes" type="button" onclick="window.__submitVote('${escapeAttr(b.gate)}', true)">&#10003; Yes</button>
            <button class="accuracy-btn accuracy-no" type="button" onclick="window.__submitVote('${escapeAttr(b.gate)}', false)">&#10007; No</button>
            <span class="accuracy-count">0 &#10003; &middot; 0 &#10007;</span>
          </div>
          <div class="comment-section">
            <button class="comment-toggle" type="button" onclick="window.__toggleComments('${escapeAttr(b.gate)}')">&#9662; Comments</button>
            <div class="comment-body" id="comments-${escapeAttr(b.gate)}" style="display:none">
              <div class="comment-form">
                <textarea class="comment-input" id="comment-input-${escapeAttr(b.gate)}" placeholder="What should renters know?" maxlength="500" rows="2"></textarea>
                <button class="comment-submit" type="button" onclick="window.__submitComment('${escapeAttr(b.gate)}')">Submit</button>
              </div>
              <div class="comment-list" id="comment-list-${escapeAttr(b.gate)}"></div>
            </div>
          </div>
        </div>
      </section>

      <footer class="detail-apply-row">
        <button class="detail-save" type="button" data-favorited="${fav ? 'true' : 'false'}">
          ${HEART_FILL_ICON}
          <span>Save</span>
        </button>
        <a class="detail-apply-now" href="${escapeAttr(b.sourceUrl || '#')}" target="_blank" rel="noopener">Apply now</a>
      </footer>

      <div class="detail-toast" role="status" aria-live="polite"></div>
    </section>
  `;
}

function bedRangeLabel(b: Building): string {
  const beds: string[] = [];
  if (b.studio) beds.push('Studio');
  if (b.br1) beds.push('1 bedroom');
  if (b.br2) beds.push('2 bedroom');
  if (beds.length === 0) return '—';
  if (beds.length === 1) return beds[0];
  return `${beds[0]} – ${beds[beds.length - 1]}`;
}

function amenityTiles(amenities: AmenityKey[]): string {
  const tiles: string[] = [];
  if (amenities.length > 5) {
    for (const key of amenities.slice(0, 5)) tiles.push(amenityTile(key));
    tiles.push(`
      <button class="amenity-tile amenity-tile-more" type="button" data-action="view-all-amenities">
        <span class="amenity-tile-icon">${MORE_ICON}</span>
        <span class="amenity-tile-label">View all</span>
      </button>
    `);
  } else {
    for (const key of amenities.slice(0, 6)) tiles.push(amenityTile(key));
    while (tiles.length < 6) {
      tiles.push(`<div class="amenity-tile amenity-tile-empty" aria-hidden="true"></div>`);
    }
  }
  return tiles.join('');
}

function amenityTile(key: AmenityKey): string {
  return `
    <div class="amenity-tile">
      <span class="amenity-tile-icon">${AMENITY_ICON[key]}</span>
      <span class="amenity-tile-label">${AMENITY_LABEL[key]}</span>
    </div>
  `;
}

function transitListItem(t: TransitStop): string {
  return `
    <li class="transit-item">
      <span class="transit-icon">${TRANSIT_ICON[t.mode]}</span>
      <span class="transit-name">${escapeHtml(t.name)}</span>
      <span class="transit-mins">${t.mins} min walk</span>
    </li>
  `;
}

// ---------------------------------------------------------------------------
// Mini-map — building-centered ~600m view
// ---------------------------------------------------------------------------

function renderMiniMap(b: Building, zoneTint: string): string {
  const VW = 320;
  const VH = 160;
  const RADIUS_M = 600;
  const latSpan = (RADIUS_M / 111000) * 2;
  const lngSpan = (RADIUS_M / 88000) * 2;
  const latMin = b.lat - latSpan / 2;
  const latMax = b.lat + latSpan / 2;
  const lngMin = b.lng - lngSpan / 2;
  const lngMax = b.lng + lngSpan / 2;

  const project = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * VW;
    const y = ((latMax - lat) / (latMax - latMin)) * VH;
    return { x, y };
  };

  const neighbors = BUILDINGS
    .filter(other => other.gate !== b.gate)
    .map(other => ({
      other,
      dist: haversineMeters(b.lat, b.lng, other.lat, other.lng),
    }))
    .filter(({ dist }) => dist <= RADIUS_M)
    .sort((a, c) => a.dist - c.dist)
    .slice(0, 3);

  const center = project(b.lat, b.lng);

  const grid: string[] = [];
  for (let i = 1; i < 6; i++) {
    const x = (i / 6) * VW;
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${VH}" stroke="#d1d5db" stroke-width="0.5"/>`);
  }
  for (let i = 1; i < 4; i++) {
    const y = (i / 4) * VH;
    grid.push(`<line x1="0" y1="${y}" x2="${VW}" y2="${y}" stroke="#d1d5db" stroke-width="0.5"/>`);
  }

  const neighborMarkup = neighbors.map(({ other }) => {
    const p = project(other.lat, other.lng);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#9ca3af"/>`;
  }).join('');

  const buildingPin = `
    <g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)})">
      <circle r="14" fill="${zoneTint}" opacity="0.18"/>
      <circle r="8" fill="${zoneTint}" opacity="0.28"/>
      <path d="M 0 -10 Q 6 -10, 6 -4 Q 6 2, 0 8 Q -6 2, -6 -4 Q -6 -10, 0 -10 Z" fill="${zoneTint}"/>
      <circle cx="0" cy="-4" r="2" fill="#fff"/>
    </g>
  `;

  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="${VW}" height="${VH}" fill="#f7f7f5"/>
    ${grid.join('\n    ')}
    ${neighborMarkup}
    ${buildingPin}
  </svg>`;
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function wireEvents(root: HTMLElement, b: Building): void {
  const back = root.querySelector<HTMLButtonElement>('.detail-back');
  if (back) {
    back.addEventListener('click', () => {
      if (window.history.length > 1) {
        history.back();
      } else {
        window.location.hash = '#/';
      }
    });
  }

  const share = root.querySelector<HTMLButtonElement>('.detail-share');
  if (share) {
    share.addEventListener('click', () => handleShare(root, b));
  }

  const heartButtons = root.querySelectorAll<HTMLButtonElement>('.detail-heart, .detail-save');
  heartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleFavorite(b.gate);
    });
  });
}

function paintHearts(root: HTMLElement, gate: string): void {
  const fav = isFavorite(gate);
  root.querySelectorAll<HTMLElement>('.detail-heart, .detail-save').forEach(el => {
    el.dataset.favorited = fav ? 'true' : 'false';
  });
}

function handleShare(root: HTMLElement, b: Building): void {
  const url = window.location.href;
  const title = `${b.name} · Vacancies SF`;
  const text = `${b.name} — ${b.address}, San Francisco`;

  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
  if (typeof nav.share === 'function') {
    nav.share({ url, title, text }).catch(() => {
      copyToClipboard(url, root);
    });
    return;
  }
  copyToClipboard(url, root);
}

function copyToClipboard(text: string, root: HTMLElement): void {
  const flash = (msg: string): void => flashToast(root, msg);
  const clip = navigator.clipboard;
  if (clip && typeof clip.writeText === 'function') {
    clip.writeText(text).then(
      () => flash('Link copied'),
      () => flash('Copy failed'),
    );
    return;
  }
  flash('Copy unavailable');
}

function flashToast(root: HTMLElement, message: string): void {
  const toast = root.querySelector<HTMLElement>('.detail-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toastTimer = null;
  }, 1800);
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text);
}

// ---------------------------------------------------------------------------
// Inline icons (line-art SVGs, currentColor stroke)
// ---------------------------------------------------------------------------

const CHEVRON_LEFT = `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 6 9 12 15 18"/></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>`;
const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 V16"/><polyline points="7 9 12 4 17 9"/><path d="M5 14 V19 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V14"/></svg>`;
const HEART_FILL_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const PIN_ICON_INLINE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const PHONE_ICON_INLINE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const FLOOR_PLANS_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="3" y1="11" x2="14" y2="11"/><line x1="14" y1="3" x2="14" y2="21"/><line x1="14" y1="15" x2="21" y2="15"/></svg>`;
const UNITS_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V8 L12 3 L21 8V21Z"/><rect x="9" y="13" width="6" height="8"/><line x1="6" y1="11" x2="8" y2="11"/><line x1="16" y1="11" x2="18" y2="11"/></svg>`;
const CALENDAR_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="1"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>`;
const PEOPLE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20 V18 Q3 14, 9 14 Q15 14, 15 18 V20"/><circle cx="17" cy="9" r="2.5"/><path d="M14 16 Q14 14, 17 14 Q21 14, 21 17 V19"/></svg>`;
const LAPTOP_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1"/><line x1="2" y1="19" x2="22" y2="19"/><circle cx="12" cy="10.5" r="1.5"/></svg>`;
const MORE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></svg>`;
