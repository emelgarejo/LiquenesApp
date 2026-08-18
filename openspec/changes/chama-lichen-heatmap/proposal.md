# Proposal: Chama Lichen Bioindicator Heatmap

## Intent

The Chama lichen field study has no shared visual output. Researchers cannot show where lichen thrives (parks) versus where it disappears (traffic corridors), so the air-quality narrative stays trapped in notebooks. Deliver a static SPA that renders researcher-authored JSON on Google Maps.

## Scope

### In Scope

- Static Vite + TypeScript (vanilla) SPA, `base: './'`, built to `dist/`, served from any static host.
- Google Maps basemap and Chama boundary (Av Higuereta, Av Benavides, Av Valle del Sur, Av Aviación).
- Researcher-authored input JSON as the single dataset source.
- `airQualityBand` derived from sampling, with manual override.
- Hybrid UX: semáforo default, optional heat via deck.gl `HeatmapLayer` + `GoogleMapsOverlay`, legend.

### Out of Scope (v1)

Backend/API; per-tree mandatory cover tracking; species-level taxonomy; real-time sensor data; `file://` as a supported open path.

## Capabilities

### New Capabilities

- `lichen-dataset`: input JSON schema, validation, prevalence/cover derivation, air-quality band rules.
- `map-visualization`: boundary rendering, semáforo layer, heat toggle, legend.
- `static-app-shell`: static build contract, Maps API key handling, empty/error states.

### Modified Capabilities

None — `openspec/specs/` is empty.

## Approach

Locked data contract. Top level: `schemaVersion`, `study`, `sites[]`.

| Node | Fields |
|---|---|
| site | `id`, `name`, `kind` (park\|avenue\|other), `location{lat,lng}`, `trafficExposure` (low\|medium\|high), `notes?` |
| `sampling` | `treesExamined`, `treesWithLichen`, `avgCoverByMorphology{crustose,foliose,fruticose}` (averages over lichen-bearing trees only), `dominantMorphology` |
| `pollutionProxy` | `airQualityBand` (good\|moderate\|poor), `basis` (manual\|derived_from_lichen) |
| `observations[]` | optional photos/notes; not required for map math |

Derivation default (ficha técnica): `prevalence = treesWithLichen / treesExamined`. Semáforo: `good`/Alto when prevalence ≥ 0.70; `moderate`/Medio when ≥ 0.40; `poor`/Bajo when < 0.40. Cover/morphology do not change the band under ficha rules. When `basis: "manual"` and a band is present, the manual value overrides derivation. Reference cases from ficha: Av Benavides 1/12 and Av Aviación 1/12 → poor; Parque La Coruña 20/20 → good.

## Assumptions

- `avgCoverByMorphology` averages only over trees **with** lichen (`treesWithLichen`). Trees without lichen are excluded from the cover average (they still count in prevalence via `treesExamined`).
- Sites are point locations; semáforo renders as styled markers, not parcels.
- The dataset is provisional field data and must be labeled as such in the UI.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| repo root | New | Vite + TS scaffold, env handling for the Maps key |
| `src/` | New | map bootstrap, layers, derivation, schema validation |
| `public/data/` | New | study JSON dataset + boundary GeoJSON |
| `openspec/changes/chama-lichen-heatmap/` | Modified | change artifacts |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Native Maps HeatmapLayer unavailable (2026) | High | deck.gl overlay; semáforo fallback |
| API key exposure / billing spend | Medium | referrer + API restrictions, quota alerts |
| Derivation thresholds misclassify sites | Medium | manual override plus documented thresholds |
| Provisional data read as measured truth | Medium | explicit provenance labeling in UI |

## Rollback Plan

Greenfield change. Revert the feature branch; there is no persisted data, consumer, or migration to unwind.

## Dependencies

Google Maps JavaScript API key with billing enabled; `@deck.gl/*`; digitized Chama boundary coordinates.

## Success Criteria

- [ ] Production build renders the map from static hosting (not `file://`).
- [ ] A dataset conforming to the contract drives both semáforo and heat layers.
- [ ] Derived bands match the Av Benavides reference case; manual override wins when present.
- [ ] Invalid or empty dataset produces an explicit error/empty state, not a blank map.
