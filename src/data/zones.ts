import type { ZoneId, SortMode } from '../types';

export const ZONES: ZoneId[] = [
  'embarcadero', 'rincon', 'southbeach', 'missionbay',
  'soma', 'mission', 'castro', 'hayesvalley',
  'pacificheights', 'marina', 'dogpatch', 'potrerohill',
  'nobhill', 'northbeach', 'richmond', 'sunset',
  'bernalheights', 'glenpark', 'noevalley', 'twinpeaks',
  'financialdistrict', 'tenderloin', 'westernaddition',
];

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
  {
    id: 'soma',
    eyebrow: 'ZONE 05 · SOUTH OF MARKET',
    title: 'SOMA',
    tag: 'TECH HUB · NIGHTLIFE · LOFTS',
    color: '#E74C3C',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="20" y="30" width="60" height="40" rx="3"/>
      <rect x="24" y="34" width="52" height="32" rx="1"/>
      <line x1="36" y1="42" x2="64" y2="42"/>
      <line x1="36" y1="50" x2="58" y2="50"/>
      <line x1="36" y1="58" x2="52" y2="58"/>
      <rect x="30" y="34" width="1" height="32"/>
      <rect x="35" y="70" width="30" height="3" rx="1"/>
      <rect x="42" y="73" width="16" height="8" rx="1"/>
    </svg>`,
  },
  {
    id: 'mission',
    eyebrow: 'ZONE 06 · INNER MISSION',
    title: 'MISSION',
    tag: 'TAQUERIAS · MURALS · DOLORES PARK',
    color: '#F39C12',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="28" r="18"/>
      <line x1="50" y1="10" x2="50" y2="46"/>
      <line x1="32" y1="28" x2="68" y2="28"/>
      <line x1="36" y1="16" x2="64" y2="40"/>
      <line x1="64" y1="16" x2="36" y2="40"/>
      <path d="M 20 60 Q 30 52, 40 60 Q 50 68, 60 60 Q 70 52, 80 60"/>
      <path d="M 20 72 Q 30 64, 40 72 Q 50 80, 60 72 Q 70 64, 80 72"/>
      <path d="M 20 84 Q 30 76, 40 84 Q 50 92, 60 84 Q 70 76, 80 84"/>
    </svg>`,
  },
  {
    id: 'castro',
    eyebrow: 'ZONE 07 · EUREKA VALLEY',
    title: 'CASTRO',
    tag: 'CASTRO THEATRE · RAINBOW · HISTORIC',
    color: '#9B59B6',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 30 20 L 50 8 L 70 20 L 70 50 L 30 50 Z"/>
      <rect x="42" y="30" width="16" height="20"/>
      <line x1="50" y1="30" x2="50" y2="50"/>
      <line x1="42" y1="40" x2="58" y2="40"/>
      <rect x="20" y="58" width="60" height="3"/>
      <rect x="20" y="65" width="60" height="3"/>
      <rect x="20" y="72" width="60" height="3"/>
      <rect x="20" y="79" width="60" height="3"/>
      <rect x="20" y="86" width="60" height="3"/>
    </svg>`,
  },
  {
    id: 'hayesvalley',
    eyebrow: 'ZONE 08 · CIVIC CENTER WEST',
    title: 'HAYES VALLEY',
    tag: 'BOUTIQUES · OCTAVIA BLVD · PATRICIA\'S GREEN',
    color: '#16A085',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <line x1="50" y1="92" x2="50" y2="40"/>
      <circle cx="50" cy="32" r="18"/>
      <circle cx="50" cy="32" r="10"/>
      <line x1="50" y1="60" x2="34" y2="72"/>
      <line x1="50" y1="65" x2="66" y2="77"/>
      <circle cx="36" cy="26" r="3" class="fill"/>
      <circle cx="56" cy="22" r="2" class="fill"/>
      <circle cx="48" cy="38" r="2.5" class="fill"/>
    </svg>`,
  },
  {
    id: 'pacificheights',
    eyebrow: 'ZONE 09 · UPPER FILLMORE',
    title: 'PACIFIC HEIGHTS',
    tag: 'MANSION ROW · FILLMORE · BAY VIEWS',
    color: '#27AE60',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="20" y="50" width="60" height="40"/>
      <path d="M 15 50 L 50 24 L 85 50"/>
      <rect x="30" y="60" width="12" height="14"/>
      <rect x="58" y="60" width="12" height="14"/>
      <rect x="43" y="64" width="14" height="26"/>
      <line x1="50" y1="64" x2="50" y2="90"/>
      <rect x="34" y="36" width="4" height="14"/>
      <rect x="62" y="36" width="4" height="14"/>
      <circle cx="50" cy="40" r="5"/>
    </svg>`,
  },
  {
    id: 'marina',
    eyebrow: 'ZONE 10 · WATERFRONT NORTH',
    title: 'MARINA',
    tag: 'WATERFRONT · PALACE OF FINE ARTS · CHESTNUT ST',
    color: '#2ECC71',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 40 20 L 40 70"/>
      <path d="M 40 20 L 72 35 L 40 50"/>
      <path d="M 24 75 Q 35 65, 46 75 Q 57 85, 68 75 Q 79 65, 90 75"/>
      <path d="M 14 85 Q 25 75, 36 85 Q 47 95, 58 85 Q 69 75, 80 85"/>
      <line x1="36" y1="70" x2="44" y2="70"/>
    </svg>`,
  },
  {
    id: 'dogpatch',
    eyebrow: 'ZONE 11 · CENTRAL WATERFRONT',
    title: 'DOGPATCH',
    tag: 'CRANE COVE · BREWERIES · PIER 70',
    color: '#E8956D',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <line x1="60" y1="10" x2="60" y2="90"/>
      <line x1="60" y1="10" x2="24" y2="10"/>
      <line x1="24" y1="10" x2="24" y2="20"/>
      <line x1="60" y1="30" x2="30" y2="30"/>
      <line x1="30" y1="30" x2="30" y2="40"/>
      <line x1="56" y1="90" x2="64" y2="90"/>
      <rect x="54" y="50" width="12" height="40"/>
      <line x1="60" y1="60" x2="60" y2="50"/>
      <line x1="40" y1="45" x2="54" y2="45"/>
    </svg>`,
  },
  {
    id: 'potrerohill',
    eyebrow: 'ZONE 12 · SOUTH SLOPE',
    title: 'POTRERO HILL',
    tag: 'HILLTOP VIEWS · 18TH ST CORRIDOR · SUNNY',
    color: '#EA8670',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 10 80 Q 50 30, 90 80"/>
      <circle cx="70" cy="24" r="12"/>
      <line x1="70" y1="8" x2="70" y2="12"/>
      <line x1="70" y1="36" x2="70" y2="40"/>
      <line x1="54" y1="24" x2="58" y2="24"/>
      <line x1="82" y1="24" x2="86" y2="24"/>
      <line x1="59" y1="13" x2="62" y2="16"/>
      <line x1="81" y1="13" x2="78" y2="16"/>
      <line x1="59" y1="35" x2="62" y2="32"/>
      <line x1="81" y1="35" x2="78" y2="32"/>
      <rect x="36" y="62" width="12" height="18"/>
      <rect x="52" y="56" width="12" height="24"/>
    </svg>`,
  },
  {
    id: 'nobhill',
    eyebrow: 'ZONE 13 · SUMMIT',
    title: 'NOB HILL',
    tag: 'CABLE CARS · GRACE CATHEDRAL · TOP OF THE MARK',
    color: '#C9A959',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="20" y="50" width="60" height="30" rx="2"/>
      <rect x="24" y="46" width="52" height="4"/>
      <rect x="30" y="56" width="8" height="10"/>
      <rect x="46" y="56" width="8" height="10"/>
      <rect x="62" y="56" width="8" height="10"/>
      <line x1="20" y1="80" x2="14" y2="80"/>
      <line x1="80" y1="80" x2="86" y2="80"/>
      <circle cx="24" cy="84" r="4"/>
      <circle cx="76" cy="84" r="4"/>
      <line x1="14" y1="88" x2="86" y2="88"/>
      <line x1="50" y1="36" x2="50" y2="46"/>
      <line x1="44" y1="40" x2="56" y2="40"/>
    </svg>`,
  },
  {
    id: 'northbeach',
    eyebrow: 'ZONE 14 · TELEGRAPH HILL',
    title: 'NORTH BEACH',
    tag: 'CITY LIGHTS · COIT TOWER · ITALIAN QUARTER',
    color: '#D4A574',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="40" y="16" width="20" height="60"/>
      <rect x="36" y="12" width="28" height="4"/>
      <rect x="44" y="8" width="12" height="4"/>
      <line x1="44" y1="28" x2="56" y2="28"/>
      <line x1="44" y1="38" x2="56" y2="38"/>
      <line x1="44" y1="48" x2="56" y2="48"/>
      <line x1="44" y1="58" x2="56" y2="58"/>
      <line x1="44" y1="68" x2="56" y2="68"/>
      <path d="M 20 76 Q 50 66, 80 76"/>
      <rect x="20" y="76" width="60" height="14"/>
      <line x1="50" y1="4" x2="50" y2="8"/>
    </svg>`,
  },
  {
    id: 'richmond',
    eyebrow: 'ZONE 15 · OUTER RICHMOND',
    title: 'RICHMOND',
    tag: 'GOLDEN GATE PARK · CLEMENT ST · DIM SUM',
    color: '#E67E22',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 10 70 L 30 30 L 50 70"/>
      <path d="M 50 70 L 70 30 L 90 70"/>
      <line x1="30" y1="30" x2="30" y2="20"/>
      <line x1="70" y1="30" x2="70" y2="20"/>
      <line x1="18" y1="54" x2="42" y2="54"/>
      <line x1="58" y1="54" x2="82" y2="54"/>
      <path d="M 10 78 Q 30 72, 50 78 Q 70 84, 90 78"/>
      <line x1="10" y1="70" x2="90" y2="70"/>
    </svg>`,
  },
  {
    id: 'sunset',
    eyebrow: 'ZONE 16 · OUTER SUNSET',
    title: 'SUNSET',
    tag: 'OCEAN BEACH · IRVING ST · GOLDEN GATE HEIGHTS',
    color: '#F8B195',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 10 60 Q 25 48, 40 60 Q 55 72, 70 60 Q 85 48, 100 60"/>
      <path d="M 10 72 Q 25 60, 40 72 Q 55 84, 70 72 Q 85 60, 100 72"/>
      <path d="M 10 84 Q 25 72, 40 84 Q 55 96, 70 84 Q 85 72, 100 84"/>
      <circle cx="50" cy="30" r="14"/>
      <line x1="50" y1="10" x2="50" y2="16"/>
      <line x1="50" y1="44" x2="50" y2="50"/>
      <line x1="34" y1="30" x2="28" y2="30"/>
      <line x1="66" y1="30" x2="72" y2="30"/>
      <line x1="40" y1="20" x2="36" y2="16"/>
      <line x1="60" y1="20" x2="64" y2="16"/>
    </svg>`,
  },
  {
    id: 'bernalheights',
    eyebrow: 'ZONE 17 · SOUTH CENTRAL',
    title: 'BERNAL HEIGHTS',
    tag: 'HILLTOP PARK · CORTLAND AVE · DOG-FRIENDLY',
    color: '#FF6B6B',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 10 80 Q 50 20, 90 80"/>
      <polygon points="50,22 46,32 54,32"/>
      <polygon points="50,22 44,36 50,30 56,36"/>
      <line x1="50" y1="32" x2="50" y2="42"/>
      <circle cx="34" cy="64" r="3" class="fill"/>
      <circle cx="58" cy="58" r="2" class="fill"/>
      <circle cx="44" cy="72" r="2.5" class="fill"/>
      <circle cx="66" cy="68" r="2" class="fill"/>
    </svg>`,
  },
  {
    id: 'glenpark',
    eyebrow: 'ZONE 18 · GLEN CANYON',
    title: 'GLEN PARK',
    tag: 'GLEN CANYON · VILLAGE FEEL · BART ACCESS',
    color: '#A569BD',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <line x1="30" y1="90" x2="30" y2="40"/>
      <circle cx="30" cy="30" r="14"/>
      <circle cx="30" cy="30" r="8"/>
      <line x1="60" y1="90" x2="60" y2="50"/>
      <circle cx="60" cy="40" r="12"/>
      <circle cx="60" cy="40" r="6"/>
      <line x1="80" y1="90" x2="80" y2="58"/>
      <circle cx="80" cy="50" r="10"/>
      <circle cx="80" cy="50" r="5"/>
      <line x1="10" y1="90" x2="95" y2="90"/>
    </svg>`,
  },
  {
    id: 'noevalley',
    eyebrow: 'ZONE 19 · 24TH STREET',
    title: 'NOE VALLEY',
    tag: '24TH STREET · STROLLER VALLEY · SUNNY SIDE',
    color: '#AF7AC5',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="12" y="50" width="22" height="30"/>
      <path d="M 10 50 L 23 38 L 36 50"/>
      <rect x="17" y="58" width="6" height="8"/>
      <rect x="25" y="68" width="7" height="12"/>
      <rect x="40" y="44" width="22" height="36"/>
      <path d="M 38 44 L 51 32 L 64 44"/>
      <rect x="45" y="52" width="6" height="8"/>
      <rect x="53" y="68" width="7" height="12"/>
      <rect x="68" y="48" width="22" height="32"/>
      <path d="M 66 48 L 79 36 L 92 48"/>
      <rect x="73" y="56" width="6" height="8"/>
      <rect x="81" y="68" width="7" height="12"/>
      <line x1="8" y1="80" x2="94" y2="80"/>
    </svg>`,
  },
  {
    id: 'twinpeaks',
    eyebrow: 'ZONE 20 · GEOGRAPHIC CENTER',
    title: 'TWIN PEAKS',
    tag: 'PANORAMIC VIEWS · SUTRO TOWER · MIDTOWN',
    color: '#3498DB',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <path d="M 5 80 L 30 30 L 50 55 L 70 25 L 95 80"/>
      <line x1="30" y1="30" x2="30" y2="22"/>
      <line x1="70" y1="25" x2="70" y2="17"/>
      <circle cx="30" cy="20" r="3"/>
      <circle cx="70" cy="15" r="3"/>
      <line x1="20" y1="58" x2="40" y2="58"/>
      <line x1="56" y1="52" x2="84" y2="52"/>
    </svg>`,
  },
  {
    id: 'financialdistrict',
    eyebrow: 'ZONE 21 · DOWNTOWN CORE',
    title: 'FINANCIAL DISTRICT',
    tag: 'TRANSAMERICA · SALESFORCE TOWER · FiDi',
    color: '#4A90E2',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="14" y="40" width="16" height="50"/>
      <rect x="34" y="28" width="14" height="62"/>
      <path d="M 52 10 L 60 26 L 68 10"/>
      <rect x="54" y="26" width="12" height="64"/>
      <rect x="74" y="46" width="14" height="44"/>
      <line x1="18" y1="52" x2="26" y2="52"/>
      <line x1="18" y1="62" x2="26" y2="62"/>
      <line x1="18" y1="72" x2="26" y2="72"/>
      <line x1="38" y1="40" x2="44" y2="40"/>
      <line x1="38" y1="52" x2="44" y2="52"/>
      <line x1="38" y1="64" x2="44" y2="64"/>
      <line x1="58" y1="38" x2="62" y2="38"/>
      <line x1="58" y1="50" x2="62" y2="50"/>
      <line x1="58" y1="62" x2="62" y2="62"/>
      <line x1="78" y1="56" x2="84" y2="56"/>
      <line x1="78" y1="68" x2="84" y2="68"/>
    </svg>`,
  },
  {
    id: 'tenderloin',
    eyebrow: 'ZONE 22 · CIVIC CENTER',
    title: 'TENDERLOIN',
    tag: 'CIVIC CENTER · THEATRE DISTRICT · AFFORDABLE',
    color: '#696969',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <rect x="20" y="30" width="60" height="8" rx="2"/>
      <rect x="24" y="22" width="52" height="8"/>
      <path d="M 30 22 L 50 10 L 70 22"/>
      <line x1="30" y1="38" x2="30" y2="80"/>
      <line x1="70" y1="38" x2="70" y2="80"/>
      <rect x="40" y="48" width="20" height="32"/>
      <line x1="50" y1="48" x2="50" y2="80"/>
      <line x1="40" y1="60" x2="60" y2="60"/>
      <circle cx="50" cy="16" r="2" class="fill"/>
      <rect x="20" y="80" width="60" height="4"/>
      <line x1="36" y1="86" x2="36" y2="92"/>
      <line x1="50" y1="86" x2="50" y2="92"/>
      <line x1="64" y1="86" x2="64" y2="92"/>
    </svg>`,
  },
  {
    id: 'westernaddition',
    eyebrow: 'ZONE 23 · JAPANTOWN',
    title: 'WESTERN ADDITION',
    tag: 'JAPANTOWN · FILLMORE JAZZ · ALAMO SQUARE',
    color: '#1ABC9C',
    svgMarkup: `<svg viewBox="0 0 100 100">
      <line x1="50" y1="90" x2="50" y2="50"/>
      <line x1="30" y1="90" x2="70" y2="90"/>
      <line x1="34" y1="82" x2="66" y2="82"/>
      <line x1="38" y1="74" x2="62" y2="74"/>
      <line x1="42" y1="66" x2="58" y2="66"/>
      <line x1="46" y1="58" x2="54" y2="58"/>
      <path d="M 42 50 Q 50 34, 58 50"/>
      <circle cx="50" cy="38" r="4"/>
      <line x1="50" y1="34" x2="50" y2="28"/>
      <line x1="44" y1="32" x2="40" y2="26"/>
      <line x1="56" y1="32" x2="60" y2="26"/>
    </svg>`,
  },
];
