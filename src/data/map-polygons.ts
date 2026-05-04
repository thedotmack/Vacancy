/** Simplified SVG polygon paths for each SF neighborhood zone, viewBox 0 0 400 500. */

export const NEIGHBORHOOD_PATHS: Record<string, string> = {
  // North row — bay edge
  marina:
    'M 30 20 L 130 20 L 130 80 L 30 80 Z',
  pacificheights:
    'M 30 80 L 130 80 L 130 140 L 30 140 Z',
  northbeach:
    'M 200 20 L 280 20 L 280 60 L 200 60 Z',
  nobhill:
    'M 150 60 L 220 60 L 220 120 L 150 120 Z',
  financialdistrict:
    'M 220 60 L 300 60 L 300 130 L 220 130 L 220 120 Z',
  embarcadero:
    'M 300 50 L 350 50 L 350 160 L 300 160 L 300 130 L 300 60 Z',
  tenderloin:
    'M 150 120 L 220 120 L 220 170 L 150 170 Z',
  westernaddition:
    'M 70 140 L 150 140 L 150 210 L 70 210 Z',
  hayesvalley:
    'M 100 210 L 170 210 L 170 260 L 100 260 Z',

  // Mid-right — waterfront south
  soma:
    'M 200 130 L 340 130 L 340 230 L 200 230 L 200 170 L 220 170 L 220 130 Z',
  rincon:
    'M 300 160 L 350 160 L 350 210 L 300 210 Z',
  southbeach:
    'M 300 210 L 370 210 L 370 260 L 300 260 L 300 230 L 340 230 L 340 210 Z',

  // West band
  richmond:
    'M 10 210 L 120 210 L 120 310 L 10 310 Z',
  sunset:
    'M 10 310 L 150 310 L 150 460 L 10 460 Z',

  // Central
  twinpeaks:
    'M 120 280 L 180 280 L 180 350 L 120 350 L 120 310 Z',
  castro:
    'M 150 260 L 210 260 L 210 320 L 150 320 L 150 280 L 180 280 L 170 260 Z',
  noevalley:
    'M 150 320 L 210 320 L 210 380 L 150 380 L 150 350 L 180 350 L 180 320 Z',

  // East-central
  mission:
    'M 210 230 L 300 230 L 300 330 L 210 330 L 210 260 Z',
  missionbay:
    'M 300 260 L 370 260 L 370 330 L 300 330 Z',
  dogpatch:
    'M 300 330 L 370 330 L 370 390 L 300 390 Z',
  potrerohill:
    'M 250 300 L 310 300 L 310 380 L 250 380 L 250 330 L 300 330 L 300 300 Z',

  // South
  glenpark:
    'M 140 380 L 210 380 L 210 440 L 140 440 Z',
  bernalheights:
    'M 210 380 L 290 380 L 290 450 L 210 450 Z',
};

/** Outer boundary of San Francisco (simplified). */
export const SF_CITY_OUTLINE: string =
  'M 30 20 L 280 20 L 300 50 L 350 50 L 350 210 L 370 210 L 370 390 L 310 390 L 310 380 L 290 450 L 210 450 L 210 440 L 140 440 L 120 350 L 10 310 L 10 210 L 30 140 L 30 80 Z';

/** Zone accent colors keyed by zone ID. */
export const ZONE_COLORS: Record<string, string> = {
  embarcadero: '#5DD3F0',
  rincon: '#FFD54F',
  southbeach: '#4FE0C6',
  missionbay: '#FF5DAA',
  soma: '#E74C3C',
  mission: '#F39C12',
  castro: '#9B59B6',
  hayesvalley: '#16A085',
  pacificheights: '#27AE60',
  marina: '#2ECC71',
  dogpatch: '#E8956D',
  potrerohill: '#EA8670',
  nobhill: '#C9A959',
  northbeach: '#D4A574',
  richmond: '#E67E22',
  sunset: '#F8B195',
  bernalheights: '#FF6B6B',
  glenpark: '#A569BD',
  noevalley: '#AF7AC5',
  twinpeaks: '#3498DB',
  financialdistrict: '#4A90E2',
  tenderloin: '#C9C9C9',
  westernaddition: '#1ABC9C',
};
