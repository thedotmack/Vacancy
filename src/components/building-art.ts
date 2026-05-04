import type { Building } from '../types';

/**
 * STUB — Phase 3 placeholder for Phase 2's building art renderer.
 * Phase 2 will overwrite this file at merge with the full dot-matrix
 * building rendition.
 *
 * Contract:
 *   buildingArtSVG(b, zoneTint, opts?): string
 *   - opts.variant === 'card' → ~card-sized art (zone strip)
 *   - opts.variant === 'hero' → tall hero-sized art (detail overlay)
 *
 * The stub renders a zone-tinted dot-matrix silhouette so the detail
 * overlay still has something to show in dev. The shape changes a bit
 * per-building so two buildings on the same hero don't look identical.
 */
export function buildingArtSVG(
  b: Building,
  zoneTint: string,
  opts?: { variant?: 'card' | 'hero' },
): string {
  const variant = opts?.variant ?? 'card';
  const isHero = variant === 'hero';
  const w = 100;
  const h = isHero ? 100 : 100;

  // Use the gate code to vary the silhouette deterministically.
  const seed = Array.from(b.gate).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const towerCount = 2 + (seed % 3); // 2, 3, or 4 towers
  const towers: string[] = [];
  const baseY = 80;
  const usableW = 80;
  const slotW = usableW / towerCount;

  for (let i = 0; i < towerCount; i++) {
    const towerH = 28 + ((seed + i * 17) % 36); // 28..63
    const towerW = slotW * 0.7;
    const x = 10 + i * slotW + (slotW - towerW) / 2;
    const y = baseY - towerH;
    towers.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${towerW.toFixed(1)}" height="${towerH.toFixed(1)}" fill="${zoneTint}" opacity="0.18"/>`,
    );
    // Window grid
    const cols = 3;
    const rows = Math.max(2, Math.floor(towerH / 6));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + 2 + (c * (towerW - 4)) / Math.max(1, cols - 1);
        const wy = y + 4 + (r * (towerH - 8)) / Math.max(1, rows - 1);
        const lit = ((seed + r * 7 + c * 13 + i) % 5) < 3 ? 0.9 : 0.25;
        towers.push(
          `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="1.5" height="1.5" fill="${zoneTint}" opacity="${lit}"/>`,
        );
      }
    }
  }

  // Distant skyline silhouettes behind for depth
  const skyline = `
    <rect x="2" y="60" width="6" height="20" fill="${zoneTint}" opacity="0.10"/>
    <rect x="10" y="55" width="5" height="25" fill="${zoneTint}" opacity="0.10"/>
    <rect x="84" y="58" width="6" height="22" fill="${zoneTint}" opacity="0.10"/>
    <rect x="92" y="62" width="6" height="18" fill="${zoneTint}" opacity="0.10"/>
  `;

  const groundLine = `<line x1="0" y1="80" x2="100" y2="80" stroke="${zoneTint}" stroke-opacity="0.35" stroke-width="0.4"/>`;

  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="${zoneTint}" opacity="0.06"/>
    ${skyline}
    ${groundLine}
    ${towers.join('\n    ')}
  </svg>`;
}
