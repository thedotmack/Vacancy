import type { AmenityKey } from '../types';

/**
 * Amenity icon set — line-art SVGs at 24x24 with currentColor stroke.
 * Phase 2's building card and Phase 3's detail page both consume these.
 *
 * Usage: render the string directly into the DOM. Set the parent's
 * `color` to tint the icon (stroke uses currentColor).
 */

const SVG_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const SVG_CLOSE = '</svg>';

function svg(body: string): string {
  return `${SVG_OPEN}${body}${SVG_CLOSE}`;
}

export const AMENITY_ICON: Record<AmenityKey, string> = {
  // Rooftop deck — building footprint with a sun/star above
  rooftop: svg(`
    <rect x="4" y="11" width="16" height="9" rx="0.5"/>
    <path d="M4 11 L12 5 L20 11"/>
    <line x1="8" y1="14" x2="8" y2="20"/>
    <line x1="12" y1="14" x2="12" y2="20"/>
    <line x1="16" y1="14" x2="16" y2="20"/>
    <circle cx="18" cy="4" r="1.5"/>
  `),

  // Gym / fitness — dumbbell
  gym: svg(`
    <line x1="3" y1="12" x2="21" y2="12"/>
    <rect x="2" y="9" width="3" height="6"/>
    <rect x="19" y="9" width="3" height="6"/>
    <rect x="6" y="10.5" width="2" height="3"/>
    <rect x="16" y="10.5" width="2" height="3"/>
  `),

  // Coworking — laptop with screen
  coworking: svg(`
    <rect x="4" y="6" width="16" height="10" rx="1"/>
    <line x1="2" y1="19" x2="22" y2="19"/>
    <line x1="9" y1="9" x2="15" y2="9"/>
    <line x1="9" y1="12" x2="13" y2="12"/>
  `),

  // Pet friendly — paw print
  pet: svg(`
    <circle cx="6" cy="9" r="1.6"/>
    <circle cx="10.5" cy="6" r="1.6"/>
    <circle cx="13.5" cy="6" r="1.6"/>
    <circle cx="18" cy="9" r="1.6"/>
    <path d="M8 14 C8 12.5 9.5 11 12 11 C14.5 11 16 12.5 16 14 C16 16.5 14.5 18 12 18 C9.5 18 8 16.5 8 14 Z"/>
  `),

  // Bike storage — bicycle
  bike: svg(`
    <circle cx="6" cy="16" r="3.5"/>
    <circle cx="18" cy="16" r="3.5"/>
    <line x1="6" y1="16" x2="11" y2="9"/>
    <line x1="11" y1="9" x2="18" y2="16"/>
    <line x1="11" y1="9" x2="14" y2="9"/>
    <line x1="9" y1="16" x2="15" y2="16"/>
  `),

  // Pool — water surface with ripples
  pool: svg(`
    <path d="M3 14 Q6 12, 9 14 Q12 16, 15 14 Q18 12, 21 14"/>
    <path d="M3 18 Q6 16, 9 18 Q12 20, 15 18 Q18 16, 21 18"/>
    <line x1="6" y1="6" x2="6" y2="14"/>
    <line x1="18" y1="6" x2="18" y2="14"/>
    <line x1="6" y1="9" x2="18" y2="9"/>
  `),

  // Parking — circled P
  parking: svg(`
    <rect x="4" y="4" width="16" height="16" rx="1"/>
    <path d="M9 8 L9 16 M9 8 L13 8 Q15 8, 15 10 Q15 12, 13 12 L9 12"/>
  `),

  // Doorman — person silhouette with cap
  doorman: svg(`
    <circle cx="12" cy="8" r="3"/>
    <path d="M5 21 V18 Q5 14, 12 14 Q19 14, 19 18 V21"/>
    <line x1="9" y1="5" x2="15" y2="5"/>
  `),

  // Laundry — washing machine
  laundry: svg(`
    <rect x="5" y="3" width="14" height="18" rx="1"/>
    <circle cx="12" cy="13" r="4"/>
    <circle cx="12" cy="13" r="2"/>
    <circle cx="8" cy="6.5" r="0.6" fill="currentColor"/>
    <circle cx="11" cy="6.5" r="0.6" fill="currentColor"/>
  `),

  // Concierge — bell on a stand
  concierge: svg(`
    <path d="M5 17 Q5 10, 12 10 Q19 10, 19 17 Z"/>
    <line x1="3" y1="17" x2="21" y2="17"/>
    <line x1="12" y1="10" x2="12" y2="7"/>
    <circle cx="12" cy="6" r="1"/>
    <line x1="3" y1="20" x2="21" y2="20"/>
  `),

  // Spa — flower / lotus
  spa: svg(`
    <path d="M12 12 Q8 7, 4 12 Q8 14, 12 12"/>
    <path d="M12 12 Q16 7, 20 12 Q16 14, 12 12"/>
    <path d="M12 12 Q9 16, 12 20 Q15 16, 12 12"/>
    <circle cx="12" cy="12" r="1.5"/>
  `),

  // Sauna — heat ripples over stones
  sauna: svg(`
    <path d="M5 6 Q7 4, 9 6 Q11 8, 13 6"/>
    <path d="M11 6 Q13 4, 15 6 Q17 8, 19 6"/>
    <path d="M5 10 Q7 8, 9 10 Q11 12, 13 10"/>
    <ellipse cx="9" cy="17" rx="3" ry="2"/>
    <ellipse cx="15" cy="17" rx="3" ry="2"/>
    <line x1="3" y1="20" x2="21" y2="20"/>
  `),

  // Theater — film reel / clapper
  theater: svg(`
    <rect x="3" y="9" width="18" height="11" rx="1"/>
    <path d="M3 9 L7 4 L11 9 M11 9 L15 4 L19 9"/>
    <line x1="6" y1="14" x2="9" y2="14"/>
    <line x1="11" y1="14" x2="14" y2="14"/>
    <line x1="16" y1="14" x2="19" y2="14"/>
  `),

  // Dog wash — dog face under shower drops
  dogwash: svg(`
    <path d="M7 11 L7 7 L9 9 L11 7 L11 11"/>
    <ellipse cx="9" cy="14" rx="3" ry="3"/>
    <circle cx="8" cy="13.5" r="0.5" fill="currentColor"/>
    <circle cx="10" cy="13.5" r="0.5" fill="currentColor"/>
    <line x1="14" y1="4" x2="13" y2="6"/>
    <line x1="17" y1="4" x2="16" y2="6"/>
    <line x1="20" y1="4" x2="19" y2="6"/>
    <path d="M13 8 Q16 6, 19 8 L19 12 Q16 14, 13 12 Z"/>
  `),

  // Lounge — sofa
  lounge: svg(`
    <path d="M3 14 V11 Q3 9, 5 9 H19 Q21 9, 21 11 V14"/>
    <rect x="3" y="14" width="18" height="5" rx="1"/>
    <line x1="6" y1="19" x2="6" y2="21"/>
    <line x1="18" y1="19" x2="18" y2="21"/>
    <line x1="9" y1="11" x2="9" y2="14"/>
    <line x1="15" y1="11" x2="15" y2="14"/>
  `),

  // Sun deck — chaise lounge with sun
  deck: svg(`
    <circle cx="18" cy="6" r="2"/>
    <line x1="18" y1="2" x2="18" y2="3"/>
    <line x1="22" y1="6" x2="21" y2="6"/>
    <line x1="14" y1="6" x2="15" y2="6"/>
    <line x1="3" y1="20" x2="21" y2="20"/>
    <path d="M3 16 L11 16 L13 12"/>
    <line x1="6" y1="16" x2="6" y2="20"/>
    <line x1="13" y1="12" x2="13" y2="20"/>
  `),
};

/**
 * Display label for each amenity (in SMALL CAPS for the dot-matrix typography).
 */
export const AMENITY_LABEL: Record<AmenityKey, string> = {
  rooftop: 'ROOFTOP DECK',
  gym: 'FITNESS CENTER',
  coworking: 'CO-WORKING',
  pet: 'PET FRIENDLY',
  bike: 'BIKE STORAGE',
  pool: 'SWIMMING POOL',
  parking: 'PARKING',
  doorman: 'DOORMAN',
  laundry: 'IN-UNIT LAUNDRY',
  concierge: 'CONCIERGE',
  spa: 'SPA',
  sauna: 'SAUNA',
  theater: 'THEATER ROOM',
  dogwash: 'DOG WASH',
  lounge: 'RESIDENT LOUNGE',
  deck: 'SUN DECK',
};
