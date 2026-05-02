import type { ZoneId } from '../types';
import { ZONES } from '../data/zones';
import { savePreferences } from '../utils/preferences';
import { getActiveZone, setActiveZone as setStateZone, getSortMode, getExpanded } from '../state';
import { render } from './board';
import { updateCityMap } from './city-map';

export function setActiveZone(zoneId: ZoneId, scrollToIt: boolean): void {
  if (!ZONES.includes(zoneId)) return;
  setStateZone(zoneId);
  document.body.dataset.zone = zoneId;

  document.querySelectorAll('.page-dot').forEach(dot => {
    const element = dot as HTMLElement;
    element.classList.toggle('active', element.dataset.zoneId === zoneId);
  });

  const board = document.getElementById('board');
  if (board) board.innerHTML = '';
  setTimeout(render, 20);

  if (scrollToIt) {
    const target = document.querySelector(`.zone[data-zone-id="${zoneId}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  savePreferences(getSortMode(), getActiveZone(), getExpanded());
  updateCityMap();
}

export function setupZoneSwipe(): void {
  const strip = document.getElementById('zoneStrip');
  if (!strip) return;

  const zones = strip.querySelectorAll('.zone');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const zoneId = (entry.target as HTMLElement).dataset.zoneId as ZoneId;
          if (zoneId !== getActiveZone()) setActiveZone(zoneId, false);
        }
      });
    },
    { root: strip, threshold: [0.6, 0.8] },
  );

  zones.forEach(z => observer.observe(z));

  document.querySelectorAll('.page-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const zoneId = (dot as HTMLElement).dataset.zoneId as ZoneId;
      setActiveZone(zoneId, true);
    });
  });
}
