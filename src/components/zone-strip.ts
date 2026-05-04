import type { ZoneId, Building } from '../types';
import { ZONES, ZONE_METADATA } from '../data/zones';
import { BUILDINGS } from '../data/buildings';
import { lowestPrice } from '../utils/formatters';
import { savePreferences } from '../utils/preferences';
import { getActiveZone, setActiveZone as setStateZone, getSortMode, getExpanded } from '../state';
import { renderBuildingCard } from './building-card';
import { renderZoneMiniMap } from './zone-mini-map';
import { getActiveFilters, toggleFilter, filterBuildings, type FilterKey } from './filter-state';
import { getFavorites, isFavorite, toggleFavorite } from '../utils/favorites';
import { HEART_ICON, SEARCH_ICON } from '../utils/icons';

interface ZoneStats {
  buildings: number;
  units: number;
  fromPrice: number | null;
  newThisWeek: number;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function statsForZone(zoneId: ZoneId): ZoneStats {
  const list = BUILDINGS.filter(b => b.zone === zoneId);
  const buildings = list.length;
  const units = list.reduce((acc, b) => acc + b.avail, 0);
  const prices = list.map(lowestPrice).filter(p => p > 0);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  // "New this week" — buildings whose nextAvailable list contains a date
  // within the next week (hands-on proxy until Phase 3 ships proper signals).
  const now = Date.now();
  const weekOut = now + ONE_WEEK_MS;
  let newThisWeek = 0;
  for (const b of list) {
    if (!b.nextAvailable) continue;
    if (b.nextAvailable.some(d => {
      const t = new Date(d).getTime();
      return !Number.isNaN(t) && t >= now && t <= weekOut;
    })) {
      newThisWeek++;
    }
  }
  return { buildings, units, fromPrice, newThisWeek };
}

function compactPrice(price: number): string {
  if (price >= 10000) return '$' + Math.round(price / 1000) + 'K';
  return '$' + price.toLocaleString();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function chevronLeft(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function starIcon(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

const FILTER_PILL_DEFS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'studio', label: 'Studio+', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" stroke-width="1.4"/></svg>' },
  { key: 'pet', label: 'Pet Friendly', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="9" cy="5" r="1.7"/><circle cx="15" cy="5" r="1.7"/><path d="M12 11c-3 0-6 3-6 6 0 2 2 3 4 3 1 0 1.5-1 2-1s1 1 2 1c2 0 4-1 4-3 0-3-3-6-6-6z"/></svg>' },
  { key: 'promo', label: 'Promos', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l8-8 8 8-8 8z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/></svg>' },
];

function buildAppBar(meta: { id: ZoneId; title: string }, zoneSavedCount: number): string {
  const heartActive = zoneSavedCount > 0;
  return `
    <header class="app-bar">
      <button class="app-bar-back" type="button" aria-label="Back" data-zone-back="${meta.id}">${chevronLeft()}</button>
      <h1 class="zone-title">${meta.title}</h1>
      <button class="app-bar-search" type="button" aria-label="Search">${SEARCH_ICON}</button>
      <button class="app-bar-heart ${heartActive ? 'is-active' : ''}" type="button" aria-label="Saved zone" data-zone-heart="${meta.id}">${HEART_ICON}</button>
    </header>
  `;
}

function buildStatsRow(zoneId: ZoneId): string {
  const stats = statsForZone(zoneId);
  const fromPrice = stats.fromPrice ? compactPrice(stats.fromPrice) : '—';
  return `
    <section class="zone-stats-row">
      <div class="stat-card">
        <div class="stat-card-value">${stats.buildings}</div>
        <div class="stat-card-label">BUILDINGS</div>
      </div>
      <div class="stat-card stat-card-price">
        <div class="stat-card-label-top">FROM</div>
        <div class="stat-card-value">${fromPrice}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.units}</div>
        <div class="stat-card-label">UNITS</div>
      </div>
      <button class="stat-pill new-this-week" type="button" data-zone-new="${zoneId}">
        <span class="stat-pill-icon">${starIcon()}</span>
        <span class="stat-pill-text">
          <span class="stat-pill-line">NEW LISTINGS</span>
          <span class="stat-pill-line">THIS WEEK${stats.newThisWeek > 0 ? ` (${stats.newThisWeek})` : ''}</span>
        </span>
      </button>
    </section>
  `;
}

function buildFilterPills(): string {
  const active = getActiveFilters();
  return `
    <section class="filter-pills" role="group" aria-label="Filters">
      ${FILTER_PILL_DEFS.map(({ key, label, icon }) => {
        const isActive = active.has(key);
        return `<button type="button" class="filter-pill ${isActive ? 'is-active' : ''}" data-filter="${key}" aria-pressed="${isActive}">
          <span class="filter-pill-icon">${icon}</span>
          <span class="filter-pill-label">${label}</span>
        </button>`;
      }).join('')}
    </section>
  `;
}

function buildListMapToggle(): string {
  return `
    <div class="list-map-toggle" role="tablist" aria-label="View mode">
      <button class="toggle-btn active" type="button" data-view="list" role="tab" aria-selected="true">LIST</button>
      <button class="toggle-btn" type="button" data-view="map" role="tab" aria-selected="false">MAP</button>
    </div>
  `;
}

function buildFooter(): string {
  const savedCount = getFavorites().size;
  return `
    <footer class="zone-footer">
      <button class="saved-link" type="button" data-zone-saved>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span>SAVED <strong data-saved-count>${savedCount}</strong></span>
      </button>
      <button class="compare-cta" type="button" data-zone-compare>COMPARE LISTINGS</button>
    </footer>
  `;
}

function buildZonePageHTML(zoneId: ZoneId): string {
  const meta = ZONE_METADATA.find(z => z.id === zoneId);
  if (!meta) return '';
  const list = BUILDINGS.filter(b => b.zone === zoneId);
  const zoneSavedCount = list.filter(b => isFavorite(b.gate)).length;
  return `
    <section class="zone-page" data-zone-id="${zoneId}" style="--zone-tint:${meta.color}">
      ${buildAppBar(meta, zoneSavedCount)}
      <p class="zone-subtitle">${escapeHtml(meta.subtitle)}</p>
      ${buildStatsRow(zoneId)}
      <section class="zone-map-area">
        <div class="zone-mini-map" data-zone-mini-map="${zoneId}">${renderZoneMiniMap(zoneId)}</div>
      </section>
      ${buildListMapToggle()}
      ${buildFilterPills()}
      <section class="building-card-list" data-zone-list="${zoneId}"></section>
      ${buildFooter()}
    </section>
  `;
}

/**
 * Build the 23 zone panels into #zonePages. Card lists are populated by
 * `render()` so filter changes can re-render without rebuilding the panel.
 */
export function buildZonePages(): void {
  const container = document.getElementById('zonePages');
  if (container) {
    container.innerHTML = ZONES.map(buildZonePageHTML).join('');
  }

  wireZoneInteractions();
}

/**
 * Render every zone's filtered building card list. Called on initial mount
 * and whenever filters or favorites change. We re-render the whole list and
 * re-attach delegated handlers (which live on the page-level container so
 * they survive innerHTML swaps).
 */
export function render(): void {
  const filters = getActiveFilters();
  ZONES.forEach(zoneId => {
    const meta = ZONE_METADATA.find(z => z.id === zoneId);
    if (!meta) return;
    const list = BUILDINGS.filter(b => b.zone === zoneId);
    const filtered = filterBuildings(list, filters);
    const target = document.querySelector<HTMLElement>(`.building-card-list[data-zone-list="${zoneId}"]`);
    if (!target) return;
    target.innerHTML = filtered.length === 0
      ? '<div class="empty card-empty"><div class="big">NO MATCHES</div>TRY DIFFERENT FILTERS</div>'
      : filtered.map(b => renderBuildingCard(b, meta.color)).join('');
  });

  // Refresh app-bar heart state and saved-link counts.
  refreshFavoriteIndicators();
  // Refresh filter pill aria-pressed state.
  refreshFilterPills();
}

function refreshFavoriteIndicators(): void {
  const totalSaved = getFavorites().size;
  document.querySelectorAll<HTMLElement>('[data-saved-count]').forEach(el => {
    el.textContent = String(totalSaved);
  });
  document.querySelectorAll<HTMLElement>('[data-zone-heart]').forEach(el => {
    const zoneId = el.dataset.zoneHeart as ZoneId | undefined;
    if (!zoneId) return;
    const list = BUILDINGS.filter((b: Building) => b.zone === zoneId);
    const zoneSaved = list.filter((b: Building) => isFavorite(b.gate)).length;
    el.classList.toggle('is-active', zoneSaved > 0);
  });
}

function refreshFilterPills(): void {
  const active = getActiveFilters();
  document.querySelectorAll<HTMLButtonElement>('.filter-pill[data-filter]').forEach(btn => {
    const key = btn.dataset.filter as FilterKey | undefined;
    if (!key) return;
    const isActive = active.has(key);
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Wire all per-zone interactions. We use event delegation on the
 * `#zonePages` container so handlers survive card-list innerHTML swaps.
 */
function wireZoneInteractions(): void {
  const root = document.getElementById('zonePages');
  if (!root) return;

  // Filter pills
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const pill = target.closest<HTMLButtonElement>('.filter-pill[data-filter]');
    if (pill) {
      const key = pill.dataset.filter as FilterKey;
      toggleFilter(key);
      // filters-changed listener will re-render — but make the click feel snappy.
      return;
    }

    // List/Map toggle
    const toggleBtn = target.closest<HTMLButtonElement>('.toggle-btn[data-view]');
    if (toggleBtn) {
      const page = toggleBtn.closest<HTMLElement>('.zone-page');
      if (!page) return;
      const view = toggleBtn.dataset.view;
      page.dataset.view = view ?? 'list';
      page.querySelectorAll<HTMLButtonElement>('.toggle-btn[data-view]').forEach(b => {
        const isActive = b === toggleBtn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
      return;
    }

    // Card heart
    const heartBtn = target.closest<HTMLButtonElement>('.card-fav[data-card-fav]');
    if (heartBtn) {
      e.preventDefault();
      const gate = heartBtn.dataset.cardFav!;
      const next = toggleFavorite(gate);
      heartBtn.classList.toggle('is-active', next);
      heartBtn.setAttribute('aria-pressed', String(next));
      heartBtn.setAttribute('aria-label', next ? 'Remove from favorites' : 'Save building');
      refreshFavoriteIndicators();
      return;
    }

    // Zone-level back button — Phase 2 just bounces home for now.
    const backBtn = target.closest<HTMLButtonElement>('[data-zone-back]');
    if (backBtn) {
      e.preventDefault();
      window.location.hash = '#/';
      return;
    }
  });
}

/**
 * Programmatically activate a zone — updates body theme, dots, state.
 * `scrollToIt=true` smooth-scrolls the panel into view.
 */
export function setActiveZone(zoneId: ZoneId, scrollToIt: boolean): void {
  if (!ZONES.includes(zoneId)) return;
  setStateZone(zoneId);
  document.body.dataset.zone = zoneId;

  if (scrollToIt) {
    const pages = document.getElementById('zonePages');
    const target = document.querySelector<HTMLElement>(`.zone-page[data-zone-id="${zoneId}"]`);
    if (pages && target) {
      pages.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  }

  savePreferences(getSortMode(), getActiveZone(), getExpanded());
}

/**
 * Wire whole-page horizontal swipe between zones.
 */
export function setupZoneSwipe(): void {
  const pages = document.getElementById('zonePages');
  if (!pages) return;

  let scrollEndTimer: number | null = null;
  let lastDetectedZone: ZoneId | null = null;

  const detectActiveZone = (): void => {
    const panels = pages.querySelectorAll<HTMLElement>('.zone-page');
    if (panels.length === 0) return;
    const center = pages.scrollLeft + pages.clientWidth / 2;

    let nearest: HTMLElement | null = null;
    let bestDistance = Infinity;
    panels.forEach(panel => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const distance = Math.abs(panelCenter - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = panel;
      }
    });

    if (!nearest) return;
    const zoneId = (nearest as HTMLElement).dataset.zoneId as ZoneId;
    if (zoneId && zoneId !== lastDetectedZone) {
      lastDetectedZone = zoneId;
      if (zoneId !== getActiveZone()) setActiveZone(zoneId, false);
    }
  };

  const supportsScrollEnd = 'onscrollend' in window;
  if (supportsScrollEnd) {
    pages.addEventListener('scrollend', detectActiveZone);
  } else {
    pages.addEventListener('scroll', () => {
      if (scrollEndTimer !== null) clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(detectActiveZone, 140);
    }, { passive: true });
  }
}
