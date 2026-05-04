import type { Building } from '../types';

/**
 * Procedural dot-matrix building silhouette.
 *
 * Inspired by the mockup's "art on top of card" — 1 to 3 abstract building
 * silhouettes drawn as a grid of pixel dots with window rows. The silhouette
 * shape (count, heights, window matrix density) is derived deterministically
 * from a hash of `b.gate` so each building has a consistent visual identity.
 *
 * Two variants:
 *   - card: ~120px tall, simpler silhouette
 *   - hero: ~280px tall, more detail
 */

interface ArtOptions {
  variant?: 'card' | 'hero';
}

function hashGate(gate: string): number {
  let h = 0;
  for (let i = 0; i < gate.length; i++) {
    h = (h * 31 + gate.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface Silhouette {
  buildingCount: number;
  heights: number[];      // 0..1, taller means closer to top
  widths: number[];       // relative widths, sum normalized later
  windowRows: number[];   // per-building window-row count
  windowCols: number[];   // per-building window-col count
}

function silhouetteFor(b: Building): Silhouette {
  const h = hashGate(b.gate);
  // 1..3 buildings — bias toward 2 for a richer skyline.
  const buildingCount = 1 + ((h >>> 1) % 3);
  const heights: number[] = [];
  const widths: number[] = [];
  const windowRows: number[] = [];
  const windowCols: number[] = [];

  for (let i = 0; i < buildingCount; i++) {
    // Force unsigned 32-bit so `%` results stay non-negative.
    const seed = ((h >>> (i * 4)) ^ ((i + 1) * 0x9e3779b9)) >>> 0;
    // 0.45..0.95 for height variance
    heights.push(0.45 + ((seed % 51) / 100));
    // 0.6..1.4 width variance
    widths.push(0.6 + (((seed >>> 7) % 81) / 100));
    // 4..8 window rows
    windowRows.push(4 + ((seed >>> 11) % 5));
    // 3..6 window cols
    windowCols.push(3 + ((seed >>> 15) % 4));
  }
  return { buildingCount, heights, widths, windowRows, windowCols };
}

export function buildingArtSVG(b: Building, zoneTint: string, opts?: ArtOptions): string {
  const variant = opts?.variant ?? 'card';
  const isHero = variant === 'hero';

  const viewW = 320;
  const viewH = isHero ? 280 : 130;

  const sil = silhouetteFor(b);

  // The silhouette body is always rendered in brand cyan so non-cyan zones
  // (e.g. missionbay's pink, mission's red) still produce a recognizable
  // building. The zoneTint is reserved for ambient backdrop accents — the
  // background dot pattern, ground line, and rooftop antenna — so each zone
  // keeps its visual identity without flattening the silhouette into a
  // monochrome block.
  const BUILDING_BODY = '#2EB6FF';

  // Background dot grid
  const dotSize = isHero ? 4 : 3;
  const dotSpacing = isHero ? 9 : 7;
  const dotR = isHero ? 0.9 : 0.7;

  // Skyline base lives on this Y, buildings rise upward from here.
  const baseY = viewH - (isHero ? 18 : 10);
  const maxBuildingHeight = isHero ? 220 : 105;

  // Compute total width of the cluster
  const totalRel = sil.widths.reduce((a, c) => a + c, 0);
  const usableW = viewW * 0.78;
  const startX = (viewW - usableW) / 2;
  const unit = usableW / totalRel;

  // Generate buildings
  let buildings = '';
  let cursorX = startX;
  for (let i = 0; i < sil.buildingCount; i++) {
    const w = sil.widths[i] * unit;
    const buildingH = sil.heights[i] * maxBuildingHeight;
    const x = cursorX + (i === 0 ? 0 : 2); // small gap
    const y = baseY - buildingH;
    const drawW = w - 4;

    // Dotted silhouette: render the building as a grid of pixels.
    const cellSize = isHero ? 5 : 4;
    const cellGap = 1;
    const stride = cellSize + cellGap;
    const cols = Math.max(2, Math.floor(drawW / stride));
    const rows = Math.max(4, Math.floor(buildingH / stride));

    // Outer fill — a translucent block in BUILDING_BODY (cyan)
    buildings += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${drawW.toFixed(1)}" height="${buildingH.toFixed(1)}" rx="2" fill="${BUILDING_BODY}" opacity="0.10"/>`;

    // Pixel grid for the silhouette body — render full filled blocks of dots.
    let pixels = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = x + 2 + c * stride;
        const py = y + 2 + r * stride;
        // Edge dots are full opacity; interior dots are slightly faded so
        // the silhouette reads as a solid block of pixels with subtle texture.
        const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        const op = isEdge ? 0.78 : 0.55;
        pixels += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${cellSize}" height="${cellSize}" fill="${BUILDING_BODY}" opacity="${op}"/>`;
      }
    }
    buildings += pixels;

    // Window grid — small bright squares laid out evenly across the facade.
    // Hero builds get denser windows so the silhouette reads as a lit
    // skyscraper rather than a sparse shape.
    const winRows = sil.windowRows[i] + (isHero ? 2 : 0);
    const winCols = sil.windowCols[i] + (isHero ? 1 : 0);
    const winAreaW = drawW - 16;
    const winAreaH = buildingH - 22;
    const winCellW = winAreaW / winCols;
    const winCellH = winAreaH / winRows;
    const windowSize = Math.max(2, Math.min(winCellW, winCellH) * 0.40);
    const litThreshold = isHero ? 78 : 70;
    let windows = '';
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        // Per-window seed determines whether the window is lit + brightness.
        const seedVal = (hashGate(b.gate + 'w' + i + ':' + r + ':' + c) >>> 0) % 100;
        const lit = seedVal < litThreshold;
        if (!lit) continue;
        // Center the window inside its cell.
        const wx = x + 8 + c * winCellW + (winCellW - windowSize) / 2;
        const wy = y + 14 + r * winCellH + (winCellH - windowSize) / 2;
        const op = 0.6 + (seedVal % 30) / 100; // 0.6..0.9
        windows += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${windowSize.toFixed(1)}" height="${windowSize.toFixed(1)}" fill="#FFFFFF" opacity="${op.toFixed(2)}"/>`;
      }
    }
    buildings += windows;

    // Optional rooftop antenna for tall hero buildings
    if (isHero && sil.heights[i] > 0.75) {
      const antennaX = x + drawW / 2;
      buildings += `<line x1="${antennaX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${antennaX.toFixed(1)}" y2="${(y - 14).toFixed(1)}" stroke="${zoneTint}" stroke-width="1" opacity="0.7"/>`;
      buildings += `<circle cx="${antennaX.toFixed(1)}" cy="${(y - 14).toFixed(1)}" r="1.5" fill="${zoneTint}" opacity="0.9"/>`;
    }

    cursorX += w;
  }

  // Ground line
  const groundLine = `<line x1="0" y1="${baseY.toFixed(1)}" x2="${viewW}" y2="${baseY.toFixed(1)}" stroke="${zoneTint}" stroke-width="1" opacity="0.45"/>`;

  // Background gradient panel
  const bgPanel = `
    <defs>
      <linearGradient id="bgsky-${b.gate}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#000913" stop-opacity="0.95"/>
        <stop offset="0.6" stop-color="#01060D" stop-opacity="1"/>
        <stop offset="1" stop-color="#000000" stop-opacity="1"/>
      </linearGradient>
      <pattern id="bdots-${b.gate}" x="0" y="0" width="${dotSpacing}" height="${dotSpacing}" patternUnits="userSpaceOnUse">
        <circle cx="${(dotSize / 2).toFixed(1)}" cy="${(dotSize / 2).toFixed(1)}" r="${dotR}" fill="${zoneTint}" opacity="0.32"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="${viewW}" height="${viewH}" fill="url(#bgsky-${b.gate})"/>
    <rect x="0" y="0" width="${viewW}" height="${viewH}" fill="url(#bdots-${b.gate})"/>
  `;

  // `none` lets the silhouette stretch to fill the container — buildings are
  // abstract dot patterns so a small aspect skew is unnoticed and we avoid
  // letterboxing or cropping the ground line.
  return `<svg viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="none" class="building-art-svg" role="img" aria-label="${b.name}">
    ${bgPanel}
    ${buildings}
    ${groundLine}
  </svg>`;
}
