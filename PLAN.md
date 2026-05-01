# SFRTA Vacancy Board — Feature Expansion Plan

## Phase 0: Documentation Discovery (Complete)

### Findings

**Dot Matrix Font**: **Doto** (Google Fonts) — a true 6x10 bitmap-inspired variable monospace font.
- Variable axes: `wght` (100–900) and `ROND` (dot roundness 0–1)
- Import: `https://fonts.googleapis.com/css2?family=Doto:wght@100;200;300;400;500;600;700;800;900&display=swap`
- License: OFL-1.1
- Source: https://fonts.google.com/specimen/Doto

**SF Neighborhood Data**: DataSF official GeoJSON — 41 analysis neighborhoods.
- Source: https://data.sfgov.org/Geographic-Locations-and-Boundaries/Analysis-Neighborhoods/p5b7-5n3h
- Alternative: https://github.com/blackmad/neighborhoods (detailed polygon coords)

**Dot Matrix Map Technique**: SVG `<pattern>` fills with `<circle>` elements on neighborhood polygon paths.
- Each neighborhood gets a `<pattern id="dots-{zone}">` with its neon color
- Paths from simplified GeoJSON polygons
- Hover/active state via CSS `filter: drop-shadow()` for neon glow

**Comments + Voting**: Neon Postgres via Vercel Marketplace + Vercel Serverless Functions (`/api` routes).
- Neon free tier: 100 CU-hours/month, 0.5GB storage
- Install via Vercel Marketplace → "Neon" — credentials auto-injected as `POSTGRES_URL`
- Use `@neondatabase/serverless` driver (edge-compatible, HTTP-based)
- API routes live in `/api/` directory — Vercel auto-deploys them as serverless functions
- Anonymous feedback only — no auth required

### Anti-Patterns to Avoid
- Do NOT use `@vercel/postgres` (sunset — use `@neondatabase/serverless` directly)
- Do NOT use Vercel KV (sunset)
- Do NOT use SVG pixelation filters (Safari compat issues)
- Do NOT add Leaflet/Mapbox dependencies — pure SVG is sufficient for a static neighborhood map
- Do NOT add authentication — anonymous feedback only
- Do NOT use ORM — raw SQL via neon serverless driver is sufficient

---

## Phase 1: Typography Overhaul — Dot Matrix Fonts + Larger Type

### What to implement

1. **Add Doto font** to `index.html` Google Fonts link
   - File: `index.html:22-23`
   - Add `Doto:wght@100;300;500;700;900` to the existing Google Fonts URL

2. **Increase base font size** from 14px to 16px
   - File: `src/styles/base.css:52`
   - Change `font-size: 14px` → `font-size: 16px`

3. **Replace primary font stack** with Doto
   - File: `src/styles/base.css:51`
   - Change `font-family: 'Space Mono'...` → `font-family: 'Doto', 'Space Mono', monospace`
   - Keep Space Mono as fallback while Doto loads

4. **Scale up key typography elements**:
   - `.zone-title` — bump from `clamp(22px, 6.5vw, 30px)` → `clamp(28px, 8vw, 42px)` in `src/styles/zones.css:63`
   - `.zone-subtitle` — bump from `clamp(20px, 6vw, 26px)` → `clamp(24px, 7vw, 34px)` in `src/styles/zones.css:77`
   - `.gate` — bump from `22px` → `28px` in `src/styles/board.css:26`
   - `.price` — bump from `22px` → `28px` in `src/styles/board.css:70`
   - `.building-name` — bump from `14px` → `16px` in `src/styles/board.css:42`
   - `.empty .big` — bump from `28px` → `36px` in `src/styles/base.css:182`
   - `.detail-cell .val` — bump from `19px` → `24px` in `src/styles/board.css:130`
   - `.col-header` — bump from `10px` → `12px` in `src/styles/base.css:157`
   - `.top-bar` — bump from `10px` → `11px` in `src/styles/base.css:96`

5. **Add LED glow text-shadow to Doto headings**:
   - New CSS rule for `.zone-title` adding multi-layer text-shadow for neon LED effect
   - Apply `font-variation-settings: 'ROND' 1` for round dots on headings

6. **Apply Doto to numeric/data displays** that currently use VT323:
   - `.gate`, `.price`, `.meta-row .val`, `.detail-cell .val`, `.empty .big`
   - Change from `font-family: 'VT323'` → `font-family: 'Doto', 'VT323', monospace`

### Verification
- [ ] `npm run build` succeeds
- [ ] Dev server shows Doto font loading (check Network tab for woff2)
- [ ] All text visibly larger
- [ ] Zone titles have dot-matrix character with round dots
- [ ] Prices and gate codes render in dot-matrix style
- [ ] Fallback to Space Mono/VT323 if Doto fails to load

---

## Phase 2: Expand Neighborhoods — All SF Zones

### What to implement

1. **Expand `ZoneId` type and add `sourceUrl` to Building**
   - File: `src/types.ts:1`
   - Add new zone IDs: `'soma' | 'mission' | 'castro' | 'hayesvalley' | 'pacificheights' | 'marina' | 'dogpatch' | 'potrerohill' | 'nobhill' | 'northbeach' | 'richmond' | 'sunset' | 'bernalheights' | 'glenpark' | 'noevalley' | 'twinpeaks' | 'financialdistrict' | 'tenderloin' | 'westernaddition'`
   - Add `sourceUrl: string` field to the `Building` interface — the URL of the listing page where data was sourced (e.g., apartments.com, the building's own leasing site)
   - Every building entry MUST have a `sourceUrl` pointing to the original listing page

2. **Add zone metadata** for each new neighborhood
   - File: `src/data/zones.ts`
   - Add entries to `ZONES` array and `ZONE_METADATA` array
   - Each with: `id`, `eyebrow` (ZONE ## · AREA), `title`, `tag` (landmarks), `color`, `svgMarkup` (simple iconic SVG)
   - Organize into numbered zones: 01-04 (current), 05 SoMa, 06 Mission, 07 Castro/Noe, 08 Hayes/Western, 09 Pac Heights/Marina, 10 Dogpatch/Potrero, 11 Nob/Russian/North Beach, 12 Richmond, 13 Sunset, 14 Bernal/Glen Park, 15 Twin Peaks, 16 Financial District, 17 Tenderloin

3. **Add CSS color variables** for each new zone
   - File: `src/styles/base.css` — add `body[data-zone="soma"]`, etc. blocks
   - Colors: SoMa `#E74C3C`, Mission `#F39C12`, Castro `#9B59B6`, Hayes `#16A085`, PacHeights `#27AE60`, Marina `#2ECC71`, Dogpatch `#E8956D`, Potrero `#EA8670`, Nob Hill `#C9A959`, North Beach `#D4A574`, Richmond `#E67E22`, Sunset `#F8B195`, Bernal `#FF6B6B`, Glen Park `#A569BD`, Noe Valley `#AF7AC5`, Twin Peaks `#3498DB`, Financial `#4A90E2`, Tenderloin `#696969`, Western Addition `#1ABC9C`

4. **Generate HTML zone sections** in `index.html`
   - Add `<section class="zone">` for each new neighborhood in the zone-strip
   - Add corresponding `.page-dot` elements
   - Each zone section follows the existing pattern with eyebrow, title, subtitle, tag, neon-bg SVG

5. **Add `sourceUrl` to all existing buildings** in `src/data/buildings.ts`
   - Each of the 12 existing buildings needs a `sourceUrl` pointing to its leasing website or listing page
   - E.g., `sourceUrl: 'https://www.thegatewaysf.com/'` for THE GATEWAY

6. **Add placeholder building entries** for new zones
   - File: `src/data/buildings.ts`
   - Add 2-3 representative buildings per new zone with realistic data
   - Gate codes: SO1-SO3 (SoMa), MI1-MI3 (Mission), CA1-CA2 (Castro), HV1-HV2 (Hayes), PH1-PH2 (PacHeights), etc.
   - Every new building MUST include a `sourceUrl`

### Verification
- [ ] `npm run build` succeeds
- [ ] TypeScript compiles without errors (all ZoneIds valid)
- [ ] Swiping through zone strip shows all neighborhoods
- [ ] Page dots match zone count
- [ ] Each zone displays its buildings when active
- [ ] Zone accent colors change when switching zones
- [ ] `npm run test` passes

---

## Phase 3: Dot Matrix City Map

### What to implement

1. **Create map component** `src/components/city-map.ts`
   - Export `renderCityMap()` function
   - Generates an inline SVG of San Francisco with simplified neighborhood polygons
   - Each neighborhood path filled with a dot-matrix `<pattern>` (circles on dark bg)
   - Active zone highlighted with brighter dots + neon drop-shadow
   - Tappable neighborhoods fire `setActiveZone()`

2. **Create simplified SF polygon data** `src/data/map-polygons.ts`
   - Manually simplified polygon paths for each neighborhood (not full GeoJSON — simplified to ~10-20 points each)
   - Exported as `Record<ZoneId, string>` mapping zone IDs to SVG `d` path strings
   - Bounding box: roughly 320x400 viewBox, oriented north-up
   - Include SF city outline path

3. **Define SVG dot patterns** in the map SVG
   - One `<pattern>` per zone color: `<pattern id="map-dots-{zone}"><circle r="1.5" fill="{color}"/></pattern>`
   - Active zone gets `r="2"` (brighter/larger dots)
   - Inactive zones get `opacity: 0.3`

4. **Add map section to `index.html`**
   - Insert `<div id="cityMap" class="city-map"></div>` between the zone-strip and meta-row
   - Collapsible via a toggle button: `▼ CITY MAP` / `▲ HIDE MAP`

5. **Add map styles** `src/styles/map.css`
   - Dark background, neon glow on active zone
   - Neighborhood labels in Doto font at small size
   - Hover/active states with `filter: drop-shadow()`
   - Smooth transitions between active zones
   - Import in `src/main.ts`

6. **Wire up interactivity** in `src/main.ts`
   - On zone change, update map highlight
   - On map neighborhood tap, switch to that zone and scroll zone-strip

### Verification
- [ ] Map renders all neighborhoods as dot-filled polygons
- [ ] Active zone visually highlighted (brighter dots, glow)
- [ ] Tapping a neighborhood switches the board to that zone
- [ ] Map toggle button shows/hides correctly
- [ ] Map looks good on mobile (fits viewport width)
- [ ] `npm run build` succeeds

---

## Phase 4: Neon Postgres Database Setup

### What to implement

1. **Install `@neondatabase/serverless`** as a dependency
   - `npm install @neondatabase/serverless`
   - This is the only new runtime dependency

2. **Create database schema** `schema.sql` (reference file, run once via Neon console)
   ```sql
   CREATE TABLE comments (
     id SERIAL PRIMARY KEY,
     building_gate VARCHAR(10) NOT NULL,
     text TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE accuracy_votes (
     id SERIAL PRIMARY KEY,
     building_gate VARCHAR(10) NOT NULL,
     vote BOOLEAN NOT NULL,
     voter_fingerprint VARCHAR(64) NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_comments_gate ON comments(building_gate);
   CREATE INDEX idx_votes_gate ON accuracy_votes(building_gate);
   CREATE UNIQUE INDEX idx_votes_unique ON accuracy_votes(building_gate, voter_fingerprint);
   ```
   - `voter_fingerprint` = hash of User-Agent + IP (lightweight dedup, no auth)
   - UNIQUE index on `(building_gate, voter_fingerprint)` prevents double-voting server-side

3. **Create Vercel Serverless API routes**:

   **`api/feedback/[buildingGate].ts`** — GET + POST handler
   - GET: Returns `{ comments: [...], votes: { yes: number, no: number }, userVoted: boolean }`
   - POST body `{ comment?: string, vote?: boolean }`:
     - If `comment`: INSERT into comments (sanitize text, max 500 chars)
     - If `vote` present: INSERT into accuracy_votes with ON CONFLICT DO NOTHING (idempotent)
   - Uses `neon()` from `@neondatabase/serverless` with `DATABASE_URL` env var
   - Returns updated feedback state after write

   **`api/feedback/index.ts`** — GET bulk endpoint
   - Returns vote counts for all buildings in one query (for board render)
   - `SELECT building_gate, SUM(CASE WHEN vote THEN 1 ELSE 0 END) as yes_count, SUM(CASE WHEN NOT vote THEN 1 ELSE 0 END) as no_count FROM accuracy_votes GROUP BY building_gate`

4. **Create client-side API module** `src/utils/feedback-api.ts`
   - `fetchAllVoteCounts(): Promise<Record<string, { yes: number; no: number }>>`
   - `fetchBuildingFeedback(gate: string): Promise<BuildingFeedback>`
   - `submitVote(gate: string, isAccurate: boolean): Promise<void>`
   - `submitComment(gate: string, text: string): Promise<void>`
   - All calls to `/api/feedback/...` with proper error handling
   - Cache vote counts in memory for duration of session (avoid re-fetching on every row expand)

5. **Vercel environment setup**
   - Connect Neon via Vercel Marketplace (auto-injects `DATABASE_URL`)
   - For local dev: `.env.local` with `DATABASE_URL=postgresql://...` (gitignored)

### Verification
- [ ] `npm run build` succeeds
- [ ] `api/feedback/[buildingGate].ts` responds to GET with empty feedback
- [ ] POST with `{ "vote": true }` records a vote
- [ ] POST with `{ "comment": "test" }` records a comment
- [ ] Second vote from same fingerprint is silently ignored (no error)
- [ ] Bulk GET returns aggregated vote counts
- [ ] `DATABASE_URL` not committed to git

---

## Phase 5: Comments + Accuracy Voting UI

### What to implement

1. **Add feedback types** to `src/types.ts`
   ```typescript
   export interface BuildingComment {
     text: string;
     created_at: string;
   }
   export interface BuildingFeedback {
     comments: BuildingComment[];
     accuracyVotes: { yes: number; no: number };
     userVoted: boolean;
   }
   ```
   (The `Building` interface already has `sourceUrl` added in Phase 2.)

2. **Add "VIEW SOURCE" link button** to expanded row actions in `src/components/board.ts`
   - In the `.actions` grid (currently CALL LEASING + DIRECTIONS), add a third button:
     ```
     [🔗 VIEW SOURCE]
     ```
   - Links to `building.sourceUrl` — opens in new tab (`target="_blank" rel="noopener"`)
   - Styled same as existing `.action-btn`
   - Update `.actions` grid from `grid-template-columns: 1fr 1fr` → `1fr 1fr 1fr`
   - Add a link icon SVG (external-link style) to `src/utils/icons.ts`

3. **Fetch vote counts on board render** in `src/components/board.ts`
   - On initial render, call `fetchAllVoteCounts()` once
   - Pass vote counts into `buildRow()` to display inline
   - Show `12 ✓ · 3 ✗` next to each building name or in the detail section

4. **Add accuracy voting UI** to expanded row in `src/components/board.ts`
   - After the detail-meta section, add:
     ```
     IS THIS ACCURATE?  [✓ YES]  [✗ NO]    12 YES · 3 NO
     ```
   - Buttons are `.accuracy-btn` styled like existing `.action-btn` but smaller
   - After voting, buttons dim and show "VOTED" state
   - Vote counts update optimistically (increment locally, POST in background)

5. **Add comment form** to expanded row in `src/components/board.ts`
   - After accuracy voting, add:
     ```
     LEAVE A COMMENT ▾
     [textarea placeholder="What should renters know?" maxlength="500"]
     [SUBMIT COMMENT]
     ```
   - Collapsible comment section (tap "LEAVE A COMMENT" to expand)
   - On expand, fetch comments for that building via `fetchBuildingFeedback(gate)`
   - Show existing comments below (newest first, max 10 displayed)
   - Each comment: text + relative timestamp ("2H AGO", "1D AGO")
   - Submit button POSTs to API then prepends new comment to list

6. **Add feedback styles** to `src/styles/board.css`
   - `.accuracy-section` — flex row with buttons and vote count
   - `.accuracy-btn` — small neon-bordered buttons, dot-matrix font
   - `.accuracy-btn.voted` — dimmed state after voting
   - `.comment-section` — collapsible area
   - `.comment-input` — dark textarea matching board aesthetic
   - `.comment-list` — list of prior comments
   - `.comment-item` — individual comment with timestamp

7. **Wire up event handlers**
   - `window.__submitVote(gate, isAccurate)` — POST vote, update UI optimistically
   - `window.__submitComment(gate)` — POST comment, prepend to list
   - `window.__toggleComments(gate)` — expand/collapse comment section, lazy-fetch
   - Add to `src/main.ts` global declarations and bindings
   - Use `onclick` with `event.stopPropagation()` to prevent row toggle

### Verification
- [ ] "VIEW SOURCE" button appears in expanded row and links to correct listing page
- [ ] Y/N buttons appear in expanded row
- [ ] Clicking Y or N sends POST, shows "VOTED" state, updates count
- [ ] Vote persists across browsers (server-side)
- [ ] Double-voting prevented (same browser gets 409/ignored)
- [ ] Comment form appears and submits
- [ ] Comments from other users visible after refresh
- [ ] Comment timestamps display correctly ("2H AGO" etc.)
- [ ] Optimistic UI updates feel instant
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

---

## Phase 6: Final Verification + Polish

### What to verify

1. **Build**: `npm run build` produces clean output, no TS errors
2. **Tests**: `npm run test` — all existing + new tests pass
3. **Visual QA on mobile**:
   - Zone strip swipe works with 17+ zones (performance)
   - Page dots don't overflow on small screens (may need horizontal scroll)
   - Map is usable at 375px width
   - Text is readable at new larger sizes
   - Comment form is usable on mobile keyboard
4. **Grep for anti-patterns**:
   - No `@vercel/postgres` imports (use `@neondatabase/serverless`)
   - No Leaflet/Mapbox dependencies
   - No hardcoded zone count assumptions (search for magic number `4`)
   - No `DATABASE_URL` in committed files (grep for postgres connection strings)
   - No raw user input in SQL (all parameterized via neon tagged template)
5. **Accessibility**:
   - Map neighborhoods have `aria-label` with neighborhood name
   - Vote buttons have `aria-pressed` state
   - Comment form has proper `<label>`

---

## Architecture Summary

```
Current:  4 zones → 12 buildings → localStorage prefs → no backend
After:   17+ zones → 40+ buildings → localStorage prefs
         + Neon Postgres (comments + votes via Vercel Functions)
         + dot-matrix typography (Doto font)
         + interactive SVG city map
         + per-listing comments + accuracy voting
```

### New Files
- `api/feedback/[buildingGate].ts` — GET/POST serverless function for per-building feedback
- `api/feedback/index.ts` — GET bulk vote counts
- `src/components/city-map.ts` — map render + interactivity
- `src/data/map-polygons.ts` — simplified SF neighborhood SVG paths
- `src/utils/feedback-api.ts` — client-side API calls to /api/feedback
- `src/styles/map.css` — map styles
- `schema.sql` — Neon Postgres schema (reference, run once)
- `.env.local` — local DATABASE_URL (gitignored)

### Modified Files
- `index.html` — Doto font link, new zone sections, map container, page dots
- `src/types.ts` — expanded ZoneId, feedback interfaces
- `src/data/zones.ts` — all neighborhood metadata
- `src/data/buildings.ts` — buildings for new zones
- `src/styles/base.css` — font stack, font sizes, zone color variables
- `src/styles/zones.css` — larger zone title sizing
- `src/styles/board.css` — larger data font sizes, feedback UI styles
- `src/components/board.ts` — voting + comment UI in expanded rows
- `src/main.ts` — new global handlers, map init, map.css import
- `package.json` — add `@neondatabase/serverless` dependency
- `.gitignore` — ensure `.env.local` is excluded

### New Dependency
- `@neondatabase/serverless` — Neon's HTTP-based Postgres driver (edge-compatible)
- Doto loads via Google Fonts CDN (same as current fonts)
- SVG map is hand-crafted, no mapping library
