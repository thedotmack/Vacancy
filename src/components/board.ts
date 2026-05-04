import type { Building, ZoneId } from '../types';
import { BUILDINGS } from '../data/buildings';
import { SORT_MODES, SORT_LABELS, ZONES } from '../data/zones';
import { formatPrice, lowestPrice, minimumBedLabel, statusForAvailability, statusDisplayLabel, buildGoogleMapsUrl } from '../utils/formatters';
import { PHONE_ICON, PIN_ICON, LINK_ICON, KEY_ICON } from '../utils/icons';
import { savePreferences } from '../utils/preferences';
import { getActiveZone, getSortMode, setSortMode, getExpanded, toggleExpanded } from '../state';
import { fetchAllVoteCounts } from '../utils/feedback-api';

let voteCounts: Record<string, { yes: number; no: number }> = {};

function buildRow(building: Building, index: number): string {
  const isOpen = getExpanded().has(building.gate);
  const status = statusForAvailability(building);
  const concessionMark = building.concession ? '<span class="deal-mark">★</span>' : '';
  const votes = voteCounts[building.gate] || { yes: 0, no: 0 };
  const tourTarget = building.tourUrl || building.sourceUrl;
  const hasTour = tourTarget && /^https?:\/\//.test(tourTarget);
  const hasSource = building.sourceUrl && /^https?:\/\//.test(building.sourceUrl);

  return `
    <div class="row ${isOpen ? 'expanded' : ''} flip-in"
         data-gate="${building.gate}"
         style="animation-delay:${Math.min(index * 70, 500)}ms"
         onclick="window.__toggleRow('${building.gate}')">
      <div class="gate">${building.gate}</div>
      <div class="building-block">
        <div class="building-name">${concessionMark}${building.name}</div>
        <div class="building-meta">${building.address.toUpperCase()}</div>
      </div>
      <div class="price-cell">
        <div class="price">${formatPrice(lowestPrice(building))}</div>
        <div class="price-from">${minimumBedLabel(building)}</div>
      </div>
      <div class="status-cell s-${status}">
        <span class="lbl"><span class="status-led"></span><span>${statusDisplayLabel(status)}</span></span>
      </div>
      <div class="details">
        <div class="detail-grid">
          <div class="detail-cell"><div class="lbl">STUDIO</div><div class="val">${formatPrice(building.studio)}</div></div>
          <div class="detail-cell"><div class="lbl">1 BED</div><div class="val">${formatPrice(building.br1)}</div></div>
          <div class="detail-cell"><div class="lbl">2 BED</div><div class="val">${formatPrice(building.br2)}</div></div>
        </div>
        <div class="detail-meta">
          <strong>${building.avail}</strong> units listed · managed by <strong>${building.mgr}</strong><br>
          ${building.notes}
        </div>
        ${building.concession ? `<div class="concession-tag">★ ${building.concession} ★</div>` : ''}
        ${hasTour ? `<a class="action-btn action-btn-primary" href="${tourTarget}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          ${KEY_ICON}<span>BOOK SELF-GUIDED TOUR</span>
        </a>` : ''}
        <div class="actions">
          <a class="action-btn" href="tel:${building.phone}" onclick="event.stopPropagation()">
            ${PHONE_ICON}<span>CALL</span>
          </a>
          <a class="action-btn" href="${buildGoogleMapsUrl(building)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${PIN_ICON}<span>MAP</span>
          </a>
          ${hasSource ? `<a class="action-btn" href="${building.sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${LINK_ICON}<span>WEBSITE</span>
          </a>` : ''}
        </div>
        <div class="accuracy-section" onclick="event.stopPropagation()">
          <span class="accuracy-label">IS THIS ACCURATE?</span>
          <button class="accuracy-btn accuracy-yes" onclick="window.__submitVote('${building.gate}', true)">&#10003; YES</button>
          <button class="accuracy-btn accuracy-no" onclick="window.__submitVote('${building.gate}', false)">&#10007; NO</button>
          <span class="accuracy-count">${votes.yes} &#10003; &middot; ${votes.no} &#10007;</span>
        </div>
        <div class="comment-section" onclick="event.stopPropagation()">
          <button class="comment-toggle" onclick="window.__toggleComments('${building.gate}')">&#9662; COMMENTS</button>
          <div class="comment-body" id="comments-${building.gate}" style="display:none">
            <div class="comment-form">
              <textarea class="comment-input" id="comment-input-${building.gate}" placeholder="What should renters know?" maxlength="500" rows="2"></textarea>
              <button class="comment-submit" onclick="window.__submitComment('${building.gate}')">SUBMIT</button>
            </div>
            <div class="comment-list" id="comment-list-${building.gate}"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildingsForZone(zone: ZoneId): Building[] {
  const sortMode = getSortMode();
  const filtered = BUILDINGS.filter(b => b.zone === zone);
  switch (sortMode) {
    case 'price': filtered.sort((a, b) => lowestPrice(a) - lowestPrice(b)); break;
    case 'inventory': filtered.sort((a, b) => b.avail - a.avail); break;
    case 'concession': filtered.sort((a, b) => b.concessionRank - a.concessionRank); break;
    default: break;
  }
  return filtered;
}

/**
 * Render all 23 zone boards into their individual containers.
 * Called once on init and again whenever sort mode changes.
 */
export function render(): void {
  ZONES.forEach(zone => {
    const list = buildingsForZone(zone);
    const board = document.getElementById(`board-${zone}`);
    if (!board) return;
    board.innerHTML = list.length === 0
      ? '<div class="empty"><div class="big">NO VACANCIES</div>CHECK BACK SOON</div>'
      : list.map((b, i) => buildRow(b, i)).join('');

    const countEl = document.getElementById(`count-${zone}`);
    if (countEl) countEl.textContent = String(list.length);
  });

  // Vote counts come from the API — fetch in background and patch counts in.
  fetchAllVoteCounts().then(counts => {
    voteCounts = counts;
    document.querySelectorAll<HTMLElement>('.accuracy-count').forEach(el => {
      const row = el.closest('.row') as HTMLElement | null;
      const gate = row?.dataset.gate;
      if (gate && voteCounts[gate]) {
        el.textContent = `${voteCounts[gate].yes} ✓ · ${voteCounts[gate].no} ✗`;
      }
    });
  });

  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) sortBtn.textContent = '⇅ SORT: ' + SORT_LABELS[getSortMode()];
}

export function toggleRow(gate: string): void {
  toggleExpanded(gate);
  document.querySelectorAll(`.row[data-gate="${gate}"]`).forEach(row => {
    row.classList.toggle('expanded');
  });
  savePreferences(getSortMode(), getActiveZone(), getExpanded());
}

export function cycleSort(): void {
  const currentIndex = SORT_MODES.indexOf(getSortMode());
  setSortMode(SORT_MODES[(currentIndex + 1) % SORT_MODES.length]);
  savePreferences(getSortMode(), getActiveZone(), getExpanded());
  render();
}
