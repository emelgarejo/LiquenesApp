# Tasks: Chama Lichen Bioindicator Heatmap

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1100–1400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 domain+scaffold → PR2 map+UI → PR3 README/local-run |
| Delivery strategy | ask-on-risk → **size:exception** (resolved for apply) |
| Chain strategy | N/A — size:exception single block |

Decision needed before apply: No (resolved: size:exception)
Chained PRs recommended: Yes (superseded by maintainer size:exception)
Chain strategy: N/A
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Vite+TS+Vitest scaffold + domain derive/validate + fixtures + unit tests | PR 1 | `npm test` | N/A — headless domain only | `package.json`, `src/config/`, `src/data/`, `src/domain/`, `public/data/chama-study.json`, colocated `*.test.ts` |
| 2 | Map layers + UI + boundary placeholder + main boot | PR 2 | `npm test` | `npm run build && npm run preview` (localhost Maps) | `src/map/`, `src/ui/`, `src/main.ts`, `index.html`, `src/styles.css`, `public/data/chama-boundary.geojson` |
| 3 | README local-only science-fair run + Maps localhost referrers | PR 3 | N/A — docs | Manual: follow README preview steps | `README.md`, `.env.example` |

## Phase 1: Scaffold

- [x] 1.1 Create `package.json`, `tsconfig.json`, `vite.config.ts` (Vite+TS, `base: './'`, Vitest).
- [x] 1.2 Create `index.html`, `src/styles.css`, `.gitignore`, `.env.example` (`VITE_GOOGLE_MAPS_API_KEY` placeholder).

## Phase 2: Domain + data (TDD)

- [x] 2.1 RED: `src/domain/derive.test.ts` — prevalence 2/12; Benavides poor; good-band case; cover means lichen-trees-only (spec).
- [x] 2.2 GREEN: `src/domain/derive.ts` + `src/config/thresholds.ts` (`avgCoverTotal` sum; heatWeight; frozen thresholds).
- [x] 2.3 RED: `src/domain/resolveBand.test.ts` — manual override wins; missing manual band → derive + warning.
- [x] 2.4 GREEN: `src/domain/resolveBand.ts`.
- [x] 2.5 RED: `src/data/validateDataset.test.ts` — drop missing sampling; reject lichen=0 + nonzero cover; accept observations-optional.
- [x] 2.6 GREEN: `src/data/types.ts`, `validateDataset.ts`, `loadDataset.ts`.
- [x] 2.7 Author `public/data/chama-study.json` with Benavides-like site (12/2, crustose ~8, derived poor) + ≥1 park site.

## Phase 3: Boundary data

- [x] 3.1 Add `public/data/chama-boundary.geojson` — user-digitized Chama polygon saved (FeatureCollection).
- [x] 3.2 Digitize Chama box (Higuereta–Benavides–Valle del Sur–Aviación) — done via user GeoJSON.

## Phase 4: Map + UI

- [x] 4.1 `src/config/env.ts` — fail-fast missing Maps key → `statusView` config error.
- [x] 4.2 `src/map/bootstrap.ts`, `boundaryLayer.ts`, `semaforoLayer.ts` — Maps load, boundary, default semáforo markers.
- [x] 4.3 `src/map/heatOverlay.ts` — deck.gl `HeatmapLayer` via `GoogleMapsOverlay` (lazy).
- [x] 4.4 `src/ui/legend.ts`, `provisionalNotice.ts`, `statusView.ts`, `layerToggle.ts` — legend, provisional label, empty/error, heat toggle.
- [x] 4.5 `src/main.ts` — boot: env → load → validate → siteViews → map or empty/error.

## Phase 5: Local delivery docs

- [x] 5.1 `README.md`: science-fair local-only (`npm run dev` / `npm run preview`); Maps key HTTP referrers for `http://localhost:*` and `127.0.0.1` Vite ports; no production deploy; `file://` unsupported.
- [x] 5.2 Manual checklist in README: map, boundary, semáforo, legend, provisional notice, heat toggle, missing-key error.
