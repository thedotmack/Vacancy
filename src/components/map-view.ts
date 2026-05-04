import { BUILDINGS } from '../data/buildings';
import type { Building } from '../types';
import { getMark, setMark, getAllMarks, onMarksChanged, type Mark } from '../utils/marks';

declare const L: any;

type Filter = 'all' | 'yes' | 'no' | 'unmarked';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unmarked', label: 'Unmarked' },
];

let map: any = null;
let markerByGate: Map<string, any> = new Map();
let activeFilter: Filter = 'all';

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
  return `
    <div class="popup-card" data-gate="${b.gate}">
      <h2>${escapeHtml(b.name)}</h2>
      <p class="address">${escapeHtml(b.address)}</p>
      <div class="prices">${priceLine(b) || '<span style="color:#888">No listed prices</span>'}</div>
      <div class="actions">
        <button class="mark-btn yes" data-action="yes" aria-pressed="${mark === 'yes'}">Yes</button>
        <button class="mark-btn no" data-action="no" aria-pressed="${mark === 'no'}">No</button>
        ${mark ? `<button class="mark-btn reset" data-action="reset">Clear</button>` : ''}
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

function passesFilter(gate: string, filter: Filter): boolean {
  const m = getMark(gate);
  if (filter === 'all') return true;
  if (filter === 'yes') return m === 'yes';
  if (filter === 'no') return m === 'no';
  return m === null; // unmarked
}

function applyFilter(): void {
  for (const b of BUILDINGS) {
    const marker = markerByGate.get(b.gate);
    if (!marker) continue;
    const visible = passesFilter(b.gate, activeFilter);
    if (visible && !map.hasLayer(marker)) marker.addTo(map);
    else if (!visible && map.hasLayer(marker)) map.removeLayer(marker);
  }
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

function renderFilters(): void {
  const el = document.getElementById('filters');
  if (!el) return;
  el.innerHTML = FILTERS.map(f =>
    `<button class="filter-pill" data-filter="${f.id}" aria-pressed="${f.id === activeFilter}">${f.label}</button>`
  ).join('');
  el.querySelectorAll<HTMLButtonElement>('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = (btn.dataset.filter as Filter) || 'all';
      renderFilters();
      applyFilter();
    });
  });
}

export function mountMap(): void {
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
    });
    marker.addTo(map);
    markerByGate.set(b.gate, marker);
  }

  renderFilters();
  renderCounts();

  onMarksChanged(() => {
    refreshMarkerIcons();
    renderCounts();
    if (activeFilter !== 'all') applyFilter();
  });
}
