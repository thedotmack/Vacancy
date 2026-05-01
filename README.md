# SFRTA Vacancies

Mobile-first rental departure board for SF Embarcadero / Rincon Hill / South Beach / Mission Bay. CRT departure-board aesthetic with per-zone color theming. PWA-enabled — installable on your phone for offline apartment hunting.

## Quick start

```bash
npm install
npm run dev        # Vite dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm test           # Run test suite
```

## Architecture

```
src/
  main.ts                  # Entry point
  types.ts                 # Building, ZoneId, SortMode types
  state.ts                 # App state management
  data/
    buildings.ts            # 11 buildings with typed schema
    zones.ts                # Zone metadata + SVG icons
  components/
    board.ts                # Departure board rendering
    zone-strip.ts           # Swipeable zone navigation
  utils/
    cache.ts                # Daily cache with stale detection
    preferences.ts          # localStorage persistence
    formatters.ts           # Price/time/status formatting
    icons.ts                # SVG icon strings
  styles/
    base.css                # Reset, variables, CRT effects
    zones.css               # Zone strip, zone cards
    board.css               # Rows, gates, prices, status LEDs
    controls.css            # Footer, buttons, legend
    animations.css          # All keyframe animations
tests/
  data.test.ts              # Building data integrity validation
  formatters.test.ts        # Formatter unit tests
```

**Stack:** Vite + TypeScript. Zero runtime dependencies. PWA via `vite-plugin-pwa` with Workbox service worker.

## Features

- Swipeable zone selector (CSS scroll-snap + IntersectionObserver)
- Per-zone color theming via CSS custom properties
- 4 sort modes: gate / price / availability / deals
- Tap-to-expand rows with CALL and DIRECTIONS actions
- PWA: installable, works offline, auto-updates
- Daily cache invalidation with stale data warning
- Safe-area insets for iPhone notch/home indicator

## Data

All 11 buildings live in `src/data/buildings.ts` with full TypeScript validation:

```ts
interface Building {
  gate: string;          // Zone-prefixed ID (E1, R2, etc.)
  zone: ZoneId;          // embarcadero | rincon | southbeach | missionbay
  name: string;
  address: string;
  avail: number;         // Unit count → status (≤6 filling, ≤9 limited, 10+ boarding)
  studio: number | null; // Price or null
  br1: number | null;
  br2: number | null;
  concession: string | null;
  concessionRank: number;
  mgr: string;
  phone: string;         // E.164 format
  lat: number;
  lng: number;
  notes: string;
}
```

## Deploy

Vercel auto-deploys on push. Manual deploy:

```bash
vercel
```

## Design

- **Fonts:** Space Mono (body), VT323 (numbers/prices)
- **Colors:** Amber base `#FFB400`, zone accents: cyan / amber-bright / teal / magenta
- **CRT effect:** Scanlines + flicker via pseudo-elements
- **Tap targets:** 48px minimum on all interactive elements
