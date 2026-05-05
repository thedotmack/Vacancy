import { BUILDINGS } from '../data/buildings';
import type { Building, AmenityKey } from '../types';
import { getMark, setMark, getAllMarks, onMarksChanged, type Mark } from '../utils/marks';
import { ZONE_METADATA } from '../data/zones';
import { buildingArtSVG } from './building-art';
import { formatPrice, lowestPrice } from '../utils/formatters';
import { buildingPhotoUrl } from '../utils/photos';

declare const L: any;

type MarkFilter = 'all' | 'yes' | 'no' | 'unmarked';
type BedFilter = 'studio' | 'br1' | 'br2';

interface FilterState {
  mark: MarkFilter;
  beds: Set<BedFilter>;
  amenities: Set<AmenityKey>;
  hasConcession: boolean;
}

const MARK_FILTERS: { id: MarkFilter; label: string; cls?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'yes', label: 'Yes', cls: 'filter-pill-yes' },
  { id: 'no', label: 'No', cls: 'filter-pill-no' },
  { id: 'unmarked', label: 'Unmarked' },
];

const BED_FILTERS: { id: BedFilter; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'br1', label: '1BR' },
  { id: 'br2', label: '2BR' },
];

const AMENITY_FILTERS: { id: AmenityKey; label: string }[] = [
  { id: 'pet', label: 'Pet OK' },
  { id: 'pool', label: 'Pool' },
  { id: 'gym', label: 'Gym' },
  { id: 'rooftop', label: 'Rooftop' },
  { id: 'parking', label: 'Parking' },
  { id: 'doorman', label: 'Doorman' },
];

let map: any = null;
let markerByGate: Map<string, any> = new Map();
let userMarker: any = null;
let userAccuracyCircle: any = null;
const filterState: FilterState = {
  mark: 'all',
  beds: new Set(),
  amenities: new Set(),
  hasConcession: false,
};

// ---------------------------------------------------------------------------
// Pins / popups
// ---------------------------------------------------------------------------

function pinIcon(mark: Mark | null): any {
  const cls = mark === 'yes' ? 'pin yes' : mark === 'no' ? 'pin no' : 'pin';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function zoneTint(b: Building): string {
  return ZONE_METADATA.find(zone => zone.id === b.zone)?.color ?? '#2EB6FF';
}

function zoneLabel(b: Building): string {
  return ZONE_METADATA.find(zone => zone.id === b.zone)?.title ?? b.zone.toUpperCase();
}

function priceLine(b: Building): string {
  const parts: string[] = [];
  if (b.studio != null) parts.push(`<span>Studio <b>$${b.studio.toLocaleString()}</b></span>`);
  if (b.br1 != null) parts.push(`<span>1BR <b>$${b.br1.toLocaleString()}</b></span>`);
  if (b.br2 != null) parts.push(`<span>2BR <b>$${b.br2.toLocaleString()}</b></span>`);
  return parts.join('');
}

function popupHtml(b: Building): string {
  const mark = getMark(b.gate);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
  const phoneHref = b.phone ? `tel:${b.phone}` : null;
  const detailHref = `#/building/${encodeURIComponent(b.gate)}`;
  return `
    <div class="popup-card" data-gate="${b.gate}">
      <h2>${escapeHtml(b.name)}</h2>
      <p class="address">${escapeHtml(b.address)}</p>
      <div class="prices">${priceLine(b) || '<span style="color:#888">No listed prices</span>'}</div>
      <div class="actions">
        <button class="mark-btn yes" data-action="yes" aria-pressed="${mark === 'yes'}">Yes</button>
        <button class="mark-btn no" data-action="no" aria-pressed="${mark === 'no'}">No</button>
        ${mark ? `<button class="mark-btn reset" data-action="reset">Clear</button>` : ''}
        <a class="mark-btn open-detail" href="${detailHref}">Full details</a>
      </div>
      <div class="links">
        <a href="${directionsUrl}" target="_blank" rel="noopener">Directions</a>
        ${phoneHref ? `<a href="${phoneHref}">Call</a>` : ''}
        ${b.sourceUrl ? `<a href="${escapeHtml(b.sourceUrl)}" target="_blank" rel="noopener">Website</a>` : ''}
      </div>
    </div>`;
}

function bindPopupActions(gate: string, popupNode: HTMLElement): void {
  popupNode.querySelectorAll<HTMLButtonElement>('.mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!action) return;
      if (action === 'yes') setMark(gate, getMark(gate) === 'yes' ? null : 'yes');
      else if (action === 'no') setMark(gate, getMark(gate) === 'no' ? null : 'no');
      else if (action === 'reset') setMark(gate, null);

      const b = BUILDINGS.find(x => x.gate === gate);
      const marker = markerByGate.get(gate);
      if (b && marker) {
        marker.setPopupContent(popupHtml(b));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

function passesMark(gate: string): boolean {
  const m = getMark(gate);
  if (filterState.mark === 'all') return true;
  if (filterState.mark === 'yes') return m === 'yes';
  if (filterState.mark === 'no') return m === 'no';
  return m === null;
}

function passesBeds(b: Building): boolean {
  if (filterState.beds.size === 0) return true;
  for (const bed of filterState.beds) {
    if (bed === 'studio' && b.studio != null) return true;
    if (bed === 'br1' && b.br1 != null) return true;
    if (bed === 'br2' && b.br2 != null) return true;
  }
  return false;
}

function passesAmenities(b: Building): boolean {
  if (filterState.amenities.size === 0) return true;
  const set = new Set(b.amenities ?? []);
  for (const need of filterState.amenities) {
    if (!set.has(need)) return false;
  }
  return true;
}

function passesConcession(b: Building): boolean {
  if (!filterState.hasConcession) return true;
  return Boolean(b.concession);
}

function passesAll(b: Building): boolean {
  return passesMark(b.gate) && passesBeds(b) && passesAmenities(b) && passesConcession(b);
}

function activeFilterCount(): number {
  let n = 0;
  if (filterState.mark !== 'all') n++;
  n += filterState.beds.size;
  n += filterState.amenities.size;
  if (filterState.hasConcession) n++;
  return n;
}

function applyFilter(): void {
  for (const b of BUILDINGS) {
    const marker = markerByGate.get(b.gate);
    if (!marker) continue;
    const visible = passesAll(b);
    if (visible && !map.hasLayer(marker)) marker.addTo(map);
    else if (!visible && map.hasLayer(marker)) map.removeLayer(marker);
  }
  renderBuildingRows();
}

function refreshMarkerIcons(): void {
  for (const b of BUILDINGS) {
    const marker = markerByGate.get(b.gate);
    if (!marker) continue;
    marker.setIcon(pinIcon(getMark(b.gate)));
  }
}

function renderCounts(): void {
  const el = document.getElementById('counts');
  if (!el) return;
  const marks = getAllMarks();
  let yes = 0, no = 0;
  for (const v of Object.values(marks)) {
    if (v === 'yes') yes++;
    else if (v === 'no') no++;
  }
  const unmarked = BUILDINGS.length - yes - no;
  el.innerHTML = `<span class="count-yes">${yes} yes</span><span class="count-no">${no} no</span><span>${unmarked} left</span>`;
}

function filteredBuildings(): Building[] {
  return BUILDINGS.filter(passesAll);
}

// ---------------------------------------------------------------------------
// Building rows
// ---------------------------------------------------------------------------

function renderPhoto(b: Building): string {
  const fallbackSvg = buildingArtSVG(b, zoneTint(b), { variant: 'card' });
  const photoSrc = buildingPhotoUrl(b, 320, 240);
  const escapedName = escapeHtml(b.name);
  return `<img src="${escapeHtml(photoSrc)}" alt="${escapedName}" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=this.dataset.fallback" data-fallback="${escapeHtml(fallbackSvg)}">`;
}

function bedsLine(b: Building): string {
  const parts: string[] = [];
  if (b.studio != null) parts.push(`Studio ${formatPrice(b.studio)}`);
  if (b.br1 != null) parts.push(`1BR ${formatPrice(b.br1)}`);
  if (b.br2 != null) parts.push(`2BR ${formatPrice(b.br2)}`);
  return parts.join(' · ') || 'Prices not listed';
}

function markLabel(mark: Mark | null): string {
  if (mark === 'yes') return 'Yes';
  if (mark === 'no') return 'No';
  return 'Unmarked';
}

function renderBuildingRow(b: Building): string {
  const mark = getMark(b.gate);
  const detailHref = `#/building/${encodeURIComponent(b.gate)}`;
  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
  const minPrice = lowestPrice(b);
  const tint = zoneTint(b);

  return `
    <article class="building-row" data-gate="${escapeHtml(b.gate)}" style="--row-tint:${tint}">
      <button class="row-map-target" type="button" data-row-map="${escapeHtml(b.gate)}" aria-label="Show ${escapeHtml(b.name)} on map">
        <figure class="row-photo">${renderPhoto(b)}</figure>
      </button>
      <div class="row-main">
        <div class="row-kicker">
          <span>${escapeHtml(b.gate)}</span>
          <span>${escapeHtml(zoneLabel(b))}</span>
          <span class="row-mark row-mark-${mark ?? 'none'}">${markLabel(mark)}</span>
        </div>
        <h3>${escapeHtml(b.name)}</h3>
        <p class="row-address">${escapeHtml(b.address)}</p>
        <p class="row-tagline">${escapeHtml(b.tagline || b.notes.split('.')[0])}</p>
        <div class="row-facts">
          <span>${minPrice ? `From ${formatPrice(minPrice)}` : 'Price TBD'}</span>
          <span>${b.avail} available</span>
          ${b.concession ? `<span>${escapeHtml(b.concession)}</span>` : ''}
        </div>
        <p class="row-beds">${escapeHtml(bedsLine(b))}</p>
      </div>
      <div class="row-actions">
        <div class="row-mark-actions" aria-label="Mark ${escapeHtml(b.name)}">
          <button class="row-mark-btn yes" type="button" data-row-mark="yes" data-gate="${escapeHtml(b.gate)}" aria-pressed="${mark === 'yes'}">Yes</button>
          <button class="row-mark-btn no" type="button" data-row-mark="no" data-gate="${escapeHtml(b.gate)}" aria-pressed="${mark === 'no'}">No</button>
        </div>
        <a class="row-detail-link" href="${detailHref}">Full details</a>
        <a class="row-secondary-link" href="${mapsHref}" target="_blank" rel="noopener">Directions</a>
      </div>
    </article>
  `;
}

function renderBuildingRows(): void {
  const rowsEl = document.getElementById('buildingRows');
  if (!rowsEl) return;

  const buildings = filteredBuildings();
  rowsEl.innerHTML = buildings.length
    ? buildings.map(renderBuildingRow).join('')
    : '<div class="empty-list">No buildings match these filters.</div>';

  const summary = document.getElementById('listSummary');
  if (summary) {
    const fc = activeFilterCount();
    const suffix = fc === 0 ? 'All' : `${fc} filter${fc === 1 ? '' : 's'}`;
    summary.textContent = `${buildings.length} of ${BUILDINGS.length} · ${suffix}`;
  }

  rowsEl.querySelectorAll<HTMLButtonElement>('[data-row-map]').forEach(btn => {
    btn.addEventListener('click', () => {
      const gate = btn.dataset.rowMap;
      if (!gate) return;
      const building = BUILDINGS.find(b => b.gate === gate);
      const marker = markerByGate.get(gate);
      if (!building || !marker) return;
      map.flyTo([building.lat, building.lng], Math.max(map.getZoom(), 15), { duration: 0.45 });
      marker.openPopup();
      setActiveRow(gate);
    });
  });

  rowsEl.querySelectorAll<HTMLButtonElement>('[data-row-mark]').forEach(btn => {
    btn.addEventListener('click', () => {
      const gate = btn.dataset.gate;
      const mark = btn.dataset.rowMark as Mark | undefined;
      if (!gate || !mark) return;
      setMark(gate, getMark(gate) === mark ? null : mark);
    });
  });
}

function setActiveRow(gate: string): void {
  document.querySelectorAll<HTMLElement>('.building-row.is-active').forEach(row => {
    row.classList.remove('is-active');
  });
  const row = document.querySelector<HTMLElement>(`.building-row[data-gate="${gate}"]`);
  if (!row) return;
  row.classList.add('is-active');
  row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ---------------------------------------------------------------------------
// Filter bar UI
// ---------------------------------------------------------------------------

function renderFilters(): void {
  const el = document.getElementById('filterBar');
  if (!el) return;

  const markPills = MARK_FILTERS.map(f =>
    `<button class="filter-pill ${f.cls ?? ''}" data-filter-mark="${f.id}" aria-pressed="${f.id === filterState.mark}">${f.label}</button>`
  ).join('');

  const bedPills = BED_FILTERS.map(f =>
    `<button class="filter-pill" data-filter-bed="${f.id}" aria-pressed="${filterState.beds.has(f.id)}">${f.label}</button>`
  ).join('');

  const amenityPills = AMENITY_FILTERS.map(f =>
    `<button class="filter-pill" data-filter-amenity="${f.id}" aria-pressed="${filterState.amenities.has(f.id)}">${f.label}</button>`
  ).join('');

  const concessionPill =
    `<button class="filter-pill" data-filter-concession aria-pressed="${filterState.hasConcession}">Deals</button>`;

  const fc = activeFilterCount();
  const clearDisabled = fc === 0 ? 'disabled' : '';

  el.innerHTML = `
    <div class="filter-group" aria-label="Mark filter">${markPills}</div>
    <div class="filter-group" aria-label="Bedroom filter">${bedPills}</div>
    <div class="filter-group" aria-label="Amenity filter">${amenityPills}</div>
    <div class="filter-group" aria-label="Concession filter">${concessionPill}</div>
    <button class="filter-clear" type="button" id="filterClear" ${clearDisabled}>Clear</button>
  `;

  el.querySelectorAll<HTMLButtonElement>('[data-filter-mark]').forEach(btn => {
    btn.addEventListener('click', () => {
      filterState.mark = (btn.dataset.filterMark as MarkFilter) || 'all';
      renderFilters();
      applyFilter();
    });
  });

  el.querySelectorAll<HTMLButtonElement>('[data-filter-bed]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bed = btn.dataset.filterBed as BedFilter | undefined;
      if (!bed) return;
      if (filterState.beds.has(bed)) filterState.beds.delete(bed);
      else filterState.beds.add(bed);
      renderFilters();
      applyFilter();
    });
  });

  el.querySelectorAll<HTMLButtonElement>('[data-filter-amenity]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.filterAmenity as AmenityKey | undefined;
      if (!a) return;
      if (filterState.amenities.has(a)) filterState.amenities.delete(a);
      else filterState.amenities.add(a);
      renderFilters();
      applyFilter();
    });
  });

  const concessionBtn = el.querySelector<HTMLButtonElement>('[data-filter-concession]');
  if (concessionBtn) {
    concessionBtn.addEventListener('click', () => {
      filterState.hasConcession = !filterState.hasConcession;
      renderFilters();
      applyFilter();
    });
  }

  const clearBtn = el.querySelector<HTMLButtonElement>('#filterClear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      filterState.mark = 'all';
      filterState.beds.clear();
      filterState.amenities.clear();
      filterState.hasConcession = false;
      renderFilters();
      applyFilter();
    });
  }
}

// ---------------------------------------------------------------------------
// Locate me
// ---------------------------------------------------------------------------

function userPinIcon(): any {
  return L.divIcon({
    className: '',
    html: `<div class="user-location-pin"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function setupLocateButton(): void {
  const btn = document.getElementById('locateMe') as HTMLButtonElement | null;
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported in this browser.');
      return;
    }
    btn.classList.add('is-locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        btn.classList.remove('is-locating');
        btn.classList.add('is-active');
        const { latitude, longitude, accuracy } = pos.coords;
        const latlng = L.latLng(latitude, longitude);

        if (userMarker) userMarker.setLatLng(latlng);
        else userMarker = L.marker(latlng, { icon: userPinIcon(), interactive: false }).addTo(map);

        if (userAccuracyCircle) userAccuracyCircle.setLatLng(latlng).setRadius(accuracy);
        else userAccuracyCircle = L.circle(latlng, {
          radius: accuracy,
          color: '#0a66c2',
          fillColor: '#0a66c2',
          fillOpacity: 0.08,
          weight: 1,
          interactive: false,
        }).addTo(map);

        const targetZoom = Math.max(map.getZoom(), 14);
        map.flyTo(latlng, targetZoom, { duration: 0.5 });
      },
      err => {
        btn.classList.remove('is-locating');
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location permission was denied.'
          : 'Could not get your location.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  });
}

// ---------------------------------------------------------------------------
// Drag handle to resize map / list
// ---------------------------------------------------------------------------

const MAP_HEIGHT_KEY = 'vacancy_map_height_px';
const MIN_MAP_HEIGHT = 140;
const MIN_LIST_HEIGHT = 200;

function applyStoredMapHeight(): void {
  const stored = localStorage.getItem(MAP_HEIGHT_KEY);
  if (stored) {
    document.body.style.setProperty('--map-height', `${stored}px`);
  }
}

function setupResizeHandle(): void {
  const handle = document.getElementById('resizeHandle');
  if (!handle) return;

  let startY = 0;
  let startMapPx = 0;
  let isDragging = false;

  const computeMaxMapHeight = (): number => {
    const topbar = document.querySelector<HTMLElement>('.topbar');
    const filters = document.querySelector<HTMLElement>('.filter-bar');
    const handleH = handle.getBoundingClientRect().height;
    const chrome = (topbar?.offsetHeight ?? 0) + (filters?.offsetHeight ?? 0) + handleH + MIN_LIST_HEIGHT;
    return Math.max(MIN_MAP_HEIGHT, window.innerHeight - chrome);
  };

  const getCurrentMapPx = (): number => {
    const wrap = document.querySelector<HTMLElement>('.map-wrap');
    return wrap?.getBoundingClientRect().height ?? window.innerHeight * 0.38;
  };

  const start = (clientY: number): void => {
    isDragging = true;
    startY = clientY;
    startMapPx = getCurrentMapPx();
    handle.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  };

  const move = (clientY: number): void => {
    if (!isDragging) return;
    const dy = clientY - startY;
    const max = computeMaxMapHeight();
    const next = Math.max(MIN_MAP_HEIGHT, Math.min(max, startMapPx + dy));
    document.body.style.setProperty('--map-height', `${next}px`);
    if (map) map.invalidateSize();
  };

  const end = (): void => {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    const finalPx = getCurrentMapPx();
    localStorage.setItem(MAP_HEIGHT_KEY, String(Math.round(finalPx)));
    if (map) map.invalidateSize();
  };

  // Pointer events (covers mouse + touch on modern browsers).
  handle.addEventListener('pointerdown', e => {
    handle.setPointerCapture(e.pointerId);
    start(e.clientY);
  });
  handle.addEventListener('pointermove', e => {
    if (!isDragging) return;
    e.preventDefault();
    move(e.clientY);
  });
  handle.addEventListener('pointerup', e => {
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    end();
  });
  handle.addEventListener('pointercancel', end);

  // Keyboard a11y: Up/Down arrows move 24px at a time.
  handle.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const delta = e.key === 'ArrowUp' ? -24 : 24;
    const cur = getCurrentMapPx();
    const max = computeMaxMapHeight();
    const next = Math.max(MIN_MAP_HEIGHT, Math.min(max, cur + delta));
    document.body.style.setProperty('--map-height', `${next}px`);
    localStorage.setItem(MAP_HEIGHT_KEY, String(Math.round(next)));
    if (map) map.invalidateSize();
  });

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

export function mountMap(): void {
  applyStoredMapHeight();

  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Bounds covering all buildings, with a little padding.
  const lats = BUILDINGS.map(b => b.lat);
  const lngs = BUILDINGS.map(b => b.lng);
  const sw = L.latLng(Math.min(...lats), Math.min(...lngs));
  const ne = L.latLng(Math.max(...lats), Math.max(...lngs));
  const bounds = L.latLngBounds(sw, ne).pad(0.15);

  map = L.map(mapEl, {
    zoomControl: true,
    attributionControl: true,
  }).fitBounds(bounds);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  for (const b of BUILDINGS) {
    const marker = L.marker([b.lat, b.lng], { icon: pinIcon(getMark(b.gate)) });
    marker.bindPopup(() => popupHtml(b), { maxWidth: 280, minWidth: 220 });
    marker.on('popupopen', (e: any) => {
      const node = e.popup.getElement() as HTMLElement | null;
      if (node) bindPopupActions(b.gate, node);
      setActiveRow(b.gate);
    });
    marker.addTo(map);
    markerByGate.set(b.gate, marker);
  }

  renderFilters();
  renderCounts();
  renderBuildingRows();
  setupLocateButton();
  setupResizeHandle();

  onMarksChanged(() => {
    refreshMarkerIcons();
    renderCounts();
    if (filterState.mark !== 'all') applyFilter();
    else renderBuildingRows();
  });

  window.setTimeout(() => map.invalidateSize(), 0);
}
