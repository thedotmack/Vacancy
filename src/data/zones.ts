import type { ZoneId, SortMode } from '../types';

export const ZONES: ZoneId[] = ['embarcadero', 'rincon', 'southbeach', 'missionbay'];

export const SORT_MODES: SortMode[] = ['gate', 'price', 'inventory', 'concession'];

export const SORT_LABELS: Record<SortMode, string> = {
  gate: 'GATE',
  price: 'PRICE',
  inventory: 'AVAIL',
  concession: 'DEALS',
};

export interface ZoneMetadata {
  id: ZoneId;
  eyebrow: string;
  title: string;
  tag: string;
  color: string;
  svgMarkup: string;
}

export const ZONE_METADATA: ZoneMetadata[] = [
  {
    id: 'embarcadero',
    eyebrow: 'ZONE 01 · NORTH WATERFRONT',
    title: 'EMBARCADERO',
    tag: 'FERRY BUILDING · CLOCK TOWER · PIER 1',
    color: '#5DD3F0',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="40" y="36" width="20" height="56"/>
      <line x1="40" y1="50" x2="60" y2="50"/>
      <line x1="40" y1="64" x2="60" y2="64"/>
      <line x1="40" y1="78" x2="60" y2="78"/>
      <rect x="36" y="33" width="28" height="3"/>
      <rect x="38" y="22" width="24" height="11"/>
      <circle cx="50" cy="14" r="9"/>
      <line x1="50" y1="14" x2="50" y2="9"/>
      <line x1="50" y1="14" x2="55" y2="14"/>
      <circle cx="50" cy="14" r="1.5" class="fill"/>
      <line x1="50" y1="5" x2="50" y2="2"/>
    </svg>`,
  },
  {
    id: 'rincon',
    eyebrow: 'ZONE 02 · EAST CUT',
    title: 'RINCON HILL',
    tag: 'LUXURY TOWER CLUSTER · 5 LISTINGS',
    color: '#FFD54F',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="22" y="22" width="22" height="68"/>
      <rect x="54" y="34" width="22" height="56"/>
      <line x1="27" y1="35" x2="39" y2="35"/>
      <line x1="27" y1="45" x2="39" y2="45"/>
      <line x1="27" y1="55" x2="39" y2="55"/>
      <line x1="27" y1="65" x2="39" y2="65"/>
      <line x1="27" y1="75" x2="39" y2="75"/>
      <line x1="27" y1="85" x2="39" y2="85"/>
      <line x1="59" y1="45" x2="71" y2="45"/>
      <line x1="59" y1="55" x2="71" y2="55"/>
      <line x1="59" y1="65" x2="71" y2="65"/>
      <line x1="59" y1="75" x2="71" y2="75"/>
      <line x1="59" y1="85" x2="71" y2="85"/>
      <line x1="33" y1="22" x2="33" y2="16"/>
      <line x1="65" y1="34" x2="65" y2="28"/>
    </svg>`,
  },
  {
    id: 'southbeach',
    eyebrow: 'ZONE 03 · BAY BRIDGE',
    title: 'SOUTH BEACH',
    tag: 'MARINA · ORACLE PARK ADJACENT',
    color: '#4FE0C6',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="20" r="6"/>
      <line x1="50" y1="26" x2="50" y2="82"/>
      <line x1="40" y1="34" x2="60" y2="34"/>
      <path d="M 24 58 Q 24 82, 50 84 Q 76 82, 76 58"/>
      <line x1="24" y1="58" x2="32" y2="62"/>
      <line x1="76" y1="58" x2="68" y2="62"/>
      <line x1="44" y1="80" x2="56" y2="80"/>
      <circle cx="50" cy="20" r="2.5" class="fill"/>
    </svg>`,
  },
  {
    id: 'missionbay',
    eyebrow: 'ZONE 04 · CHASE CENTER',
    title: 'MISSION BAY',
    tag: 'UCSF · BIOTECH · WATERFRONT TRAIL',
    color: '#FF5DAA',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="40" r="22"/>
      <ellipse cx="50" cy="40" rx="22" ry="7"/>
      <ellipse cx="50" cy="40" rx="14" ry="22"/>
      <line x1="28" y1="40" x2="72" y2="40"/>
      <rect x="18" y="80" width="64" height="2"/>
      <rect x="22" y="72" width="6" height="8"/>
      <rect x="32" y="68" width="6" height="12"/>
      <rect x="42" y="64" width="6" height="16"/>
      <rect x="52" y="70" width="6" height="10"/>
      <rect x="62" y="74" width="6" height="6"/>
      <rect x="72" y="68" width="6" height="12"/>
    </svg>`,
  },
];
