## Exploration: chama-lichen-heatmap

### Current State

Empty greenfield repository. Verified on 2026-08-16:

- Git initialized; application source absent (no `package.json`, app entry, tests, or CI).
- OpenSpec bootstrap only: `openspec/config.yaml`, empty `openspec/specs/`, `openspec/changes/archive/`.
- Engram project key `ciencias-liquenes`; `strict_tdd: false`; no test runner.
- Product intent (config + sdd-init): static SPA for lichen presence in Urbanización Chama (Surco/Lima) as heatmap and/or traffic-light overlay on Google Maps, polygon roughly bounded by Av. Higuereta, Av. Benavides, Av. Valle del Sur, Av. Aviación.

There is nothing to extend in application code. Stack and map visualization choices are greenfield decisions.

### Affected Areas

- `openspec/config.yaml` — already encodes product geography and static-SPA preference; proposal/design must stay aligned.
- `openspec/changes/chama-lichen-heatmap/` — first change artifacts (this exploration; later proposal/spec/design/tasks).
- Future scaffold (not yet present): Vite app root, `public/` or `src/data/` GeoJSON, map bootstrap module, env for Maps API key — all net-new.
- `.gitignore` / `.atl/` — tooling only; not product surface.

### Approaches

#### A. SPA stack (offline-openable static assets)

1. **Vite + TypeScript (vanilla)** — single-page app with `base: './'`, build to `dist/`, open via static host or `vite preview`.
   - Pros: smallest dependency surface; fastest to ship; relative asset paths work for nested static hosting; no React tax for a map-first UI.
   - Cons: more manual DOM/state if UI grows (toggles, legends, filters).
   - Effort: Low

2. **Vite + React + TypeScript** — same static build contract; React for legend/toggles/layers UI.
   - Pros: clearer component structure if UX grows (layer switcher, filters, about panel); `@vis.gl/react-google-maps` available.
   - Cons: heavier for v1; more files before first map paint.
   - Effort: Medium

3. **No bundler (plain HTML + CDN scripts)** — hand-written `index.html` loading Maps/deck from CDN.
   - Pros: zero toolchain for demos.
   - Cons: weak module/type safety; harder GeoJSON imports and testing later; fights OpenSpec “design stack before inventing files” discipline poorly once scope grows.
   - Effort: Low short-term / High long-term

**Stack recommendation:** Vite + TypeScript (vanilla) for v1. Revisit React only if interaction surface exceeds a map + legend + 1–2 toggles.

**“Open without a Node server” contract (precise):**

| Mode | Feasible? | Notes |
|------|-----------|-------|
| Build once → serve `dist/` on any static host (GitHub Pages, S3, nginx) | Yes (primary) | Requires `base: './'` or known public base. |
| `vite preview` / any local static file server | Yes | Correct way to demo locally. |
| Double-click `dist/index.html` via `file://` | Fragile | ES module + CORS/fetch of GeoJSON often break; Maps API key referrer restrictions for `file://` need `__file_url__` encoding and are brittle (wildcards historically unreliable). Do **not** treat `file://` as the supported product path. |

Maps always needs network for Google tiles/API regardless of local static hosting.

#### B. Map provider + heatmap implementation

1. **Google Maps JS + deck.gl `HeatmapLayer` via `GoogleMapsOverlay`** — Google’s documented replacement after native `visualization.HeatmapLayer` deprecation (May 2025) / unavailability (May 2026).
   - Pros: Satisfies “Google Maps embedded”; heat still works post-decommission; official migration path.
   - Cons: Extra dependency (`@deck.gl/*`); API key + billing still required; larger bundle.
   - Effort: Medium

2. **Google Maps JS + colored Data layer / polygons / circles (semáforo only)** — no continuous heatmap library.
   - Pros: No deck.gl; maps cleanly to traffic-light zones; lower complexity and fewer WebGL concerns.
   - Cons: Not a true continuous heatmap; density gradients need manual binning into classes.
   - Effort: Low–Medium

3. **Leaflet + leaflet.heat (or MapLibre heatmap) on OSM tiles** — drop Google for v1.
   - Pros: No Google billing; mature heat plugins; works well as static SPA.
   - Cons: Violates stated “Need Google Maps embedded” unless product accepts change; different basemap look.
   - Effort: Low–Medium

4. **Native `google.maps.visualization.HeatmapLayer`** — historical Maps API heat.
   - Pros: Familiar samples.
   - Cons: **Deprecated May 2025; unavailable as of May 2026.** Not acceptable for a greenfield started Aug 2026.
   - Effort: N/A (reject)

**Maps recommendation:** Keep Google Maps. Prefer **B1** if continuous heat is in v1; prefer **B2** if v1 is semáforo-first. Do not ship B4.

#### C. Geographic data representation

1. **Static GeoJSON in-repo**
   - `boundary.geojson`: single Polygon (or MultiPolygon) for Chama frame (vertices along Higuereta / Benavides / Valle del Sur / Aviación — digitize from satellite/OSM, not invented corners).
   - `lichen-samples.geojson`: `FeatureCollection` of Points with `properties.intensity` (0–1 or 0–100) and optional `land_use` (`park` | `avenue` | `other`).
   - Optional `zones.geojson`: Polygons or buffered corridors with `properties.semaforo` (`high` | `medium` | `low` | `null`) for traffic-light overlay.
   - Pros: No backend; versionable; fits static SPA; easy fixture swaps.
   - Cons: Sample data is illustrative until field survey; polygon accuracy depends on digitizing quality.
   - Effort: Low

2. **CSV/JSON lat,lng,weight only** — convert at build or runtime to map structures.
   - Pros: Spreadsheet-friendly for citizen science intake.
   - Cons: Weaker standards interoperability; still need separate boundary polygon.
   - Effort: Low

3. **Backend / live API** — out of scope for v1 per product assumption.
   - Effort: High (defer)

**Data recommendation:** C1 — GeoJSON boundary + weighted sample points; optional zone polygons for semáforo. Encode domain assumptions as sample fixtures (high intensity in parks, near-null on avenues) and label them as **hypothesis samples**, not measured truth, until real surveys exist.

Approximate map center for Surco/Chama (~12.14°S, 76.99°W) must be confirmed when digitizing; do not hardcode fake avenue intersections in design without a digitizing step.

#### D. Semáforo vs continuous heatmap UX

| Mode | Strength | Weakness |
|------|----------|----------|
| Continuous heatmap | Shows spatial density gradients; good for exploration | Harder for non-experts; depends on radius/maxIntensity; needs deck.gl on Google |
| Semáforo (discrete classes) | Communicates “parks green / avenues red-null” narrative clearly; easier legend | Loses nuance; class thresholds are product decisions |
| Hybrid (default semáforo + optional heat toggle) | Best of both; matches dual user ask | Slightly more UI/state |

**UX recommendation:** Hybrid — **semáforo as default** (aligned with stated park vs avenue story), continuous heat as optional layer for technical viewers. Shared GeoJSON intensity field drives both (threshold → class; weight → heat).

### Recommendation

Ship a **static Vite + TypeScript SPA** (`base: './'`) with **Google Maps** basemap, **static GeoJSON** for Chama boundary + sample lichen intensities, and a **hybrid overlay**: traffic-light zones/points by default, optional continuous heat via **deck.gl HeatmapLayer + GoogleMapsOverlay** (not the decommissioned Maps `HeatmapLayer`). Treat local demo as **static hosting / `vite preview`**, not `file://`. Keep API key out of git via env at build/runtime injection and HTTP referrer restrictions on a known deploy origin.

Defer React, Leaflet-only basemap, and any backend until product explicitly expands scope.

### Risks

- **Maps HeatmapLayer decommissioned (May 2026):** building on `visualization.HeatmapLayer` would fail; must use deck.gl or non-heat overlays.
- **Billing / Maps Platform:** Maps JavaScript API requires enabled billing; unexpected cost if key is unrestricted or traffic spikes.
- **Client-side API key exposure:** unavoidable in a static SPA; mitigate with referrer restrictions, API restrictions (Maps JS only), and quota alerts — never IP restrictions for browser keys.
- **`file://` / CORS:** GeoJSON `fetch` and ES modules often break; Maps referrer `__file_url__` is brittle — not a supported open path.
- **Key restriction mismatch:** wrong referrer list → `RefererNotAllowedMapError` on deploy.
- **Polygon accuracy:** avenue-named bounds are conceptual until digitized; wrong polygon misleads science narrative.
- **Sample vs survey data:** encoding park-high / avenue-null as hard data without labeling as provisional risks scientific misrepresentation.
- **deck.gl / WebGL:** heat on some mobile browsers has precision limits; keep semáforo fallback.
- **Greenfield + no tests:** first apply must introduce a minimal test/build story before enabling strict TDD.

### Ready for Proposal

Yes. Orchestrator should proceed to `sdd-propose` for `chama-lichen-heatmap` with this recommendation as the default architecture, and surface two product decisions only if needed:

1. Confirm Google Maps is mandatory (vs Leaflet/OSM cost-avoidance).
2. Confirm hybrid UX (semáforo default + optional heat) vs heat-only or semáforo-only for v1.
