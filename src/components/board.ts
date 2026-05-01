import type { Building } from '../types';
import { BUILDINGS } from '../data/buildings';
import { SORT_MODES, SORT_LABELS } from '../data/zones';
import { formatPrice, lowestPrice, minimumBedLabel, statusForAvailability, statusDisplayLabel, buildGoogleMapsUrl } from '../utils/formatters';
import { PHONE_ICON, PIN_ICON, LINK_ICON } from '../utils/icons';
import { savePreferences } from '../utils/preferences';
import { getActiveZone, getSortMode, setSortMode, getExpanded, toggleExpanded } from '../state';
import { fetchAllVoteCounts } from '../utils/feedback-api';

let voteCounts: Record<string, { yes: number; no: number }> = {};

function buildRow(building: Building, index: number): string {
  const isOpen = getExpanded().has(building.gate);
  const status = statusForAvailability(building);
  const concessionMark = building.concession ? '<span class="deal-mark">★</span>' : '';
  const votes = voteCounts[building.gate] || { yes: 0, no: 0 };

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
        <div class="actions" style="grid-template-columns: 1fr 1fr 1fr">
          <a class="action-btn" href="tel:${building.phone}" onclick="event.stopPropagation()">
            ${PHONE_ICON}<span>CALL LEASING</span>
          </a>
          <a class="action-btn" href="${buildGoogleMapsUrl(building)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${PIN_ICON}<span>DIRECTIONS</span>
          </a>
          <a class="action-btn" href="${building.sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${LINK_ICON}<span>VIEW SOURCE</span>
          </a>
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

function getZoneBuildings(): Building[] {
  const activeZone = getActiveZone();
  const sortMode = getSortMode();
  const filtered = BUILDINGS.filter(b => b.zone === activeZone);
  switch (sortMode) {
    case 'price': filtered.sort((a, b) => lowestPrice(a) - lowestPrice(b)); break;
    case 'inventory': filtered.sort((a, b) => b.avail - a.avail); break;
    case 'concession': filtered.sort((a, b) => b.concessionRank - a.concessionRank); break;
    default: break;
  }
  return filtered;
}

export async function render(): Promise<void> {
  // Fetch vote counts (non-blocking — render with cached data, update when ready)
  fetchAllVoteCounts().then(counts => {
    voteCounts = counts;
    // Re-render vote counts in any open rows
    document.querySelectorAll('.accuracy-count').forEach(el => {
      const row = el.closest('.row');
      if (row) {
        const gate = (row as HTMLElement).dataset.gate;
        if (gate && voteCounts[gate]) {
          el.textContent = `${voteCounts[gate].yes} ✓ · ${voteCounts[gate].no} ✗`;
        }
      }
    });
  });

  const list = getZoneBuildings();
  const board = document.getElementById('board');
  if (!board) return;

  if (list.length === 0) {
    board.innerHTML = '<div class="empty"><div class="big">NO VACANCIES</div>CHECK BACK SOON</div>';
  } else {
    board.innerHTML = list.map(buildRow).join('');
  }

  const countElement = document.getElementById('count');
  if (countElement) countElement.textContent = String(list.length);

  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) sortBtn.textContent = '⇅ SORT: ' + SORT_LABELS[getSortMode()];
}

export function toggleRow(gate: string): void {
  toggleExpanded(gate);
  const row = document.querySelector(`.row[data-gate="${gate}"]`);
  if (row) row.classList.toggle('expanded');
  savePreferences(getSortMode(), getActiveZone(), getExpanded());
}

export function cycleSort(): void {
  const currentIndex = SORT_MODES.indexOf(getSortMode());
  setSortMode(SORT_MODES[(currentIndex + 1) % SORT_MODES.length]);
  savePreferences(getSortMode(), getActiveZone(), getExpanded());
  const board = document.getElementById('board');
  if (board) board.innerHTML = '';
  setTimeout(render, 20);
}
