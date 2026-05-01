# SFRTA Vacancies

Mobile-first rental departure board for SF Embarcadero / Rincon Hill / South Beach / Mission Bay. Train-station departure-board aesthetic. Single static HTML file. Daily-cache architecture (no live data fetch yet — wired but stubbed).

## What's in here

```
apartment-finder/
├── index.html      ← the entire app: HTML + CSS + data + JS
├── vercel.json     ← clean URLs for Vercel deploys
└── README.md       ← this file
```

No build step. No dependencies. Open `index.html` directly in a browser, or push the folder to any static host.

## Deploy

**Vercel:**
```bash
cd apartment-finder
vercel --scope=<your-team>
```

**Netlify drop:** drag the folder onto netlify.com/drop.

**GitHub Pages:** push to `main`, enable Pages on `/` of `main` branch.

**Local:** open `index.html` directly, or `python3 -m http.server` and visit localhost:8000.

## Where the data lives

All 11 buildings are baked into the `BUILDINGS` array in `index.html`. Each entry:

```js
{
  gate: 'E1',                      // zone-prefixed gate ID
  zone: 'embarcadero',             // one of: embarcadero, rincon, southbeach, missionbay
  name: 'THE GATEWAY',
  address: '460 Davis Ct',
  avail: 7,                        // unit count → drives status (≤6 filling, ≤9 limited, else boarding)
  studio: 3443, br1: 4405, br2: 6018,
  concession: null,                // string or null; ★ shown next to name when present
  concessionRank: 0,               // for sort-by-deals (higher = better)
  mgr: 'INDEPENDENT',
  phone: '+14155212552',           // tel: link
  lat: 37.7965578, lng: -122.3986275,  // Google Maps deep link
  notes: "..."                     // expanded-row blurb
}
```

To swap to a live data source, replace `BUILDINGS` with a fetch in the `loadOrSeedCache()` function — the storage layer is already wired to the date-keyed cache invalidation pattern.

## What's wired

- Swipeable zone selector (CSS scroll-snap, `IntersectionObserver` for active zone detection)
- Per-zone color theming via CSS variables on `<body data-zone>`
- 4 sort modes (gate / price / availability / concessions) cycle on button tap
- Tap-to-expand rows with CALL (`tel:`) and DIRECTIONS (Google Maps) actions
- `window.storage` API persistence: sort mode, active zone, expanded rows, daily cache stamp
- Stale warning if cache > 18hr old
- Safe-area insets for iPhone notch/home indicator

## What's stubbed

- `refreshCache()` only re-stamps the timestamp. To actually re-pull data, wire a fetch from your aggregator (the original recon found Apartments.com, ApartmentList, RentCafe, and the buildings' own sites all expose data — Avalon's site is server-rendered HTML, others sit behind JS APIs).
- "Refresh" button just bumps the timestamp visually; same data shows.
- No filters per zone (price ceiling, beds, deals-only).
- No favorites, no compare, no notifications.

## Enhancement ideas

- **Live data path.** Either scrape Apartments.com per building (HTML parse) or pick one or two buildings' upstream APIs (UDR, AvalonBay, Brookfield) and unify behind a tiny serverless route.
- **Filters.** Bottom-sheet filter UI: max price slider, bed count chips, "deals only" toggle. Persist to storage.
- **Favorites.** Heart icon on each row → `window.storage` set. New "★" zone showing favorites across all neighborhoods.
- **Price history.** Daily snapshot in storage; show a tiny sparkline in the expanded row. Most aggregators don't offer this, so you'd be the first.
- **More zones.** Hayes Valley, FiDi proper, NoPa, Marina. Same data structure, just add to `ZONES` array and the `<section class="zone">` markup.
- **Push when prices drop.** Service worker + push notifications. Mobile install via "Add to Home Screen."

## Design notes

- Fonts: Space Mono (display + body), VT323 (numbers/prices). Both Google Fonts.
- Color tokens: amber base `#FFB400`, plus per-zone accent (cyan / amber-bright / teal / magenta).
- CRT effect: scanlines + occasional flicker via `body::after` keyframe.
- Min tap targets: 48px on rows, sort/refresh, action buttons. Page dots are 28×28 wrappers around 6px visible dots.
