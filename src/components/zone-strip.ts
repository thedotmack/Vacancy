import type { ZoneId } from '../types';
import { ZONES, ZONE_METADATA } from '../data/zones';
import { savePreferences } from '../utils/preferences';
import { getActiveZone, setActiveZone as setStateZone, getSortMode, getExpanded } from '../state';
import { updateCityMap } from './city-map';

/**
 * Build all 23 zone panels (hero + board container) into #zonePages,
 * and the page-dot indicators into #pageDots.
 */
export function buildZonePages(): void {
  const container = document.getElementById('zonePages');
  if (container) {
    container.innerHTML = ZONE_METADATA.map(meta => `
      <section class="zone-page" data-zone-id="${meta.id}" style="--zone-color:${meta.color}">
        <header class="zone-hero">
          <div class="zone-hero-text">
            <div class="zone-eyebrow">${meta.eyebrow}</div>
            <div class="zone-title">${meta.title}</div>
            <div class="zone-tag">${meta.tag}</div>
          </div>
          <div class="neon-bg" aria-hidden="true">${meta.svgMarkup}</div>
        </header>
        <div class="zone-meta-row">
          <div><span class="lbl">LISTINGS</span> <span class="val" id="count-${meta.id}">--</span></div>
          <div class="zone-meta-hint">&#9650; SCROLL FOR LIST &middot; SWIPE FOR ZONES &#9654;</div>
        </div>
        <div class="col-header">
          <span>GATE</span>
          <span>BUILDING</span>
          <span>FROM</span>
          <span>STATUS</span>
        </div>
        <div class="zone-board" id="board-${meta.id}"></div>
      </section>
    `).join('');
  }

  const dots = document.getElementById('pageDots');
  if (dots) {
    dots.innerHTML = ZONES.map(z =>
      `<button class="page-dot" data-zone-id="${z}" aria-label="${z}"></button>`
    ).join('');
  }
}

/**
 * Programmatically activate a zone — updates body theme, dots, map, state.
 * Use scrollToIt=true to also smooth-scroll the panel into view.
 */
export function setActiveZone(zoneId: ZoneId, scrollToIt: boolean): void {
  if (!ZONES.includes(zoneId)) return;
  setStateZone(zoneId);
  document.body.dataset.zone = zoneId;

  document.querySelectorAll('.page-dot').forEach(dot => {
    const el = dot as HTMLElement;
    el.classList.toggle('active', el.dataset.zoneId === zoneId);
  });

  if (scrollToIt) {
    const pages = document.getElementById('zonePages');
    const target = document.querySelector<HTMLElement>(`.zone-page[data-zone-id="${zoneId}"]`);
    if (pages && target) {
      pages.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  }

  savePreferences(getSortMode(), getActiveZone(), getExpanded());
  updateCityMap();
}

/**
 * Wire up the whole-page horizontal swipe.
 * - Listens for `scrollend` (or polyfills with a debounced scroll-stop timer)
 * - Snaps the active zone based on which panel is most centered when scroll settles
 * - Avoids re-rendering boards mid-swipe (boards are pre-rendered per panel)
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

  document.querySelectorAll('.page-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const zoneId = (dot as HTMLElement).dataset.zoneId as ZoneId;
      setActiveZone(zoneId, true);
    });
  });
}
