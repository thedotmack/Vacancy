import './styles/base.css';
import './styles/zones.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/animations.css';

import { loadPreferences } from './utils/preferences';
import { loadOrSeedCache, forceRefresh } from './utils/cache';
import { setupZoneSwipe } from './components/zone-strip';
import { render, toggleRow, cycleSort } from './components/board';
import { initState, getActiveZone } from './state';

declare global {
  interface Window {
    __toggleRow: (gate: string) => void;
    __cycleSort: () => void;
    __forceRefresh: () => void;
  }
}

window.__toggleRow = toggleRow;
window.__cycleSort = cycleSort;
window.__forceRefresh = () => forceRefresh(render);

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
}

document.addEventListener('DOMContentLoaded', init);
