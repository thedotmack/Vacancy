import './styles/base.css';
import './styles/zones.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/animations.css';
import './styles/map.css';

import { loadPreferences } from './utils/preferences';
import { loadOrSeedCache, forceRefresh } from './utils/cache';
import { setupZoneSwipe } from './components/zone-strip';
import { render, toggleRow, cycleSort } from './components/board';
import { renderCityMap } from './components/city-map';
import { initState, getActiveZone } from './state';
import { submitVote as apiSubmitVote, submitComment as apiSubmitComment, fetchBuildingFeedback } from './utils/feedback-api';

declare global {
  interface Window {
    __toggleRow: (gate: string) => void;
    __cycleSort: () => void;
    __forceRefresh: () => void;
    __toggleMap: () => void;
    __submitVote: (gate: string, isAccurate: boolean) => void;
    __submitComment: (gate: string) => void;
    __toggleComments: (gate: string) => void;
  }
}

window.__toggleRow = toggleRow;
window.__cycleSort = cycleSort;
window.__forceRefresh = () => forceRefresh(render);
window.__toggleMap = () => {
  const container = document.getElementById('cityMapContainer');
  const toggle = document.querySelector('#mapToggle button');
  if (container && toggle) {
    const isCollapsed = container.classList.contains('collapsed');
    container.classList.toggle('collapsed', !isCollapsed);
    container.classList.toggle('expanded', isCollapsed);
    toggle.textContent = isCollapsed ? '▲ HIDE MAP' : '▼ CITY MAP';
    toggle.setAttribute('aria-expanded', String(isCollapsed));
  }
};

window.__submitVote = async (gate: string, isAccurate: boolean) => {
  const section = document.querySelector(`.row[data-gate="${gate}"] .accuracy-section`);
  if (!section) return;

  const btns = section.querySelectorAll('.accuracy-btn');
  const countEl = section.querySelector('.accuracy-count');
  const previousText = countEl?.textContent || '0 ✓ · 0 ✗';

  btns.forEach(btn => {
    (btn as HTMLElement).style.opacity = '0.4';
    (btn as HTMLElement).style.pointerEvents = 'none';
  });
  if (countEl) {
    const match = previousText.match(/(\d+)\s*✓\s*·\s*(\d+)\s*✗/);
    if (match) {
      const yes = parseInt(match[1]) + (isAccurate ? 1 : 0);
      const no = parseInt(match[2]) + (isAccurate ? 0 : 1);
      countEl.textContent = `${yes} ✓ · ${no} ✗`;
    }
  }

  try {
    const result = await apiSubmitVote(gate, isAccurate);
    if (!result) throw new Error('Vote failed');
  } catch {
    if (countEl) countEl.textContent = previousText;
    btns.forEach(btn => {
      (btn as HTMLElement).style.opacity = '1';
      (btn as HTMLElement).style.pointerEvents = 'auto';
    });
  }
};

window.__submitComment = async (gate: string) => {
  const input = document.getElementById(`comment-input-${gate}`) as HTMLTextAreaElement | null;
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.disabled = true;

  try {
    const result = await apiSubmitComment(gate, text);
    if (result) {
      input.value = '';
      renderCommentList(gate, result.comments);
    }
  } catch {
    // Keep draft text on failure
  }
  input.disabled = false;
};

window.__toggleComments = async (gate: string) => {
  const body = document.getElementById(`comments-${gate}`);
  if (!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    const list = document.getElementById(`comment-list-${gate}`);
    if (list) list.innerHTML = '<div class="comment-loading">LOADING...</div>';
    const feedback = await fetchBuildingFeedback(gate);
    renderCommentList(gate, feedback.comments);
  }
};

function renderCommentList(gate: string, comments: Array<{ text: string; created_at: string }>): void {
  const list = document.getElementById(`comment-list-${gate}`);
  if (!list) return;
  if (comments.length === 0) {
    list.innerHTML = '<div class="comment-empty">NO COMMENTS YET</div>';
    return;
  }
  list.innerHTML = comments.map(c => {
    const ago = timeAgo(c.created_at);
    return `<div class="comment-item"><div class="comment-text">${escapeHtml(c.text)}</div><div class="comment-time">${ago}</div></div>`;
  }).join('');
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function init(): void {
  const prefs = loadPreferences();
  initState(prefs);
  loadOrSeedCache();
  setupZoneSwipe();

  const activeZone = getActiveZone();
  document.body.dataset.zone = activeZone;

  document.querySelectorAll('.page-dot').forEach(dot => {
    const element = dot as HTMLElement;
    element.classList.toggle('active', element.dataset.zoneId === activeZone);
  });

  const target = document.querySelector(`.zone[data-zone-id="${activeZone}"]`);
  if (target) target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, inline: 'center', block: 'nearest' });

  render();
  renderCityMap();
}

document.addEventListener('DOMContentLoaded', init);
