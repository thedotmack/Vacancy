/**
 * Locale-independent date formatters used by the building detail overlay.
 * We hardcode month + weekday short labels so the rendered output never
 * varies across user locales.
 */

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Parse an ISO date string (YYYY-MM-DD) as a local-time Date.
 * Using `new Date(iso)` directly would interpret it as UTC, which can
 * shift the day by one in negative timezones. Constructing with explicit
 * year/month/day keeps the calendar date stable regardless of zone.
 */
function parseIsoDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day);
  }
  // Fallback to native parse if not in expected ISO format.
  return new Date(iso);
}

/**
 * Render a move-in style date — month abbreviation + day, no leading zero.
 *   formatMoveIn('2026-06-01') → 'JUN 1'
 *   formatMoveIn('2026-12-15') → 'DEC 15'
 */
export function formatMoveIn(iso: string): string {
  const date = parseIsoDate(iso);
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Render a chip-style date — weekday + month + day.
 *   formatChipDate('2026-05-23') → 'SAT MAY 23'
 *   formatChipDate('2026-06-01') → 'MON JUN 1'
 */
export function formatChipDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${WEEKDAY_SHORT[date.getDay()]} ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}
