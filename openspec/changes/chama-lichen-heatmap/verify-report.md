```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:86eac628db86d46c3dd8bf1a7cbd8a84c98797ab9777b8cd1300471183b5efcc
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 14/14
scenarios: 18/18
test_command: npm test
test_exit_code: 0
test_output_hash: sha256:f74f9acbd65d3374055aa895a9aeff6cb871f34f3b7813da04669a0c4f72b3e3
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:993325f80980b1013a52a41f616bc211a035dd61f5e4f5816f1d9940b89d4261
```

## Verification Report

**Change**: chama-lichen-heatmap
**Version**: N/A
**Mode**: Standard

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ✅ Passed
```text
npm run build
exit 0 — tsc --noEmit && vite build; dist emitted (heatOverlay chunk ~607 kB)
```

**Tests**: ✅ 30 passed / ❌ 0 failed / ⚠️ 0 skipped
```text
npm test
exit 0 — 7 files, 30 tests passed (vitest run)
```

**Coverage**: ➖ Not available

### Spec Compliance Matrix
| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Study JSON | Observations optional | `validateDataset.test.ts > accepts sites with sampling + pollutionProxy and no observations` | ✅ COMPLIANT |
| Study JSON | Missing sampling | `validateDataset.test.ts > drops sites missing sampling` | ✅ COMPLIANT |
| Cover Over Lichen Trees | Exclude zero-lichen from cover | `derive.test.ts > sums morphology averages over lichen-bearing trees only` | ✅ COMPLIANT |
| Prevalence Formula | Prevalence 1/12 | `derive.test.ts > equals treesWithLichen / treesExamined for 1/12 (Benavides ficha)` | ✅ COMPLIANT |
| Derived Presence Band | Benavides poor | `derive.test.ts > classifies Benavides 1/12 (8.3%) as poor / Bajo` | ✅ COMPLIANT |
| Derived Presence Band | Alto conditions | `derive.test.ts > classifies Parque La Coruña 20/20 as good / Alto` | ✅ COMPLIANT |
| Derived Presence Band | Medio conditions | `derive.test.ts > classifies Santos Chocano 4/6 (66.7%) as moderate / Medio` | ✅ COMPLIANT |
| Manual Override | Manual wins | `resolveBand.test.ts > lets manual override win over derived-poor sampling` | ✅ COMPLIANT |
| Chama Boundary | Boundary visible | `boundaryGeometry.test.ts > ships a closed Polygon FeatureCollection for Chama` | ✅ COMPLIANT |
| Semáforo Default | Default semáforo | `semaforoLayer.test.ts > renders one colored marker per site without enabling heat` | ✅ COMPLIANT |
| Optional Heat | Heat from study | `heatPoints.test.ts > builds heat points from site incidencia weights` | ✅ COMPLIANT |
| Legend | Semáforo legend | `shell.contract.test.ts > renders Alto Medio Bajo legend for semáforo` | ✅ COMPLIANT |
| Provisional Label | Label visible | `shell.contract.test.ts > renders dataset status badge` | ✅ COMPLIANT |
| Static Vite SPA | Static host | `shell.contract.test.ts > uses relative base ./ for static hosting` | ✅ COMPLIANT |
| Maps API Key | Missing key error | `shell.contract.test.ts > fails fast when VITE_GOOGLE_MAPS_API_KEY is missing` | ✅ COMPLIANT |
| Empty Invalid States | Invalid dataset | `shell.contract.test.ts > maps missing study to Invalid dataset status` | ✅ COMPLIANT |
| Empty Invalid States | Zero sites | `shell.contract.test.ts > maps study with zero usable sites to empty status` | ✅ COMPLIANT |
| Provisional Shell Notice | Notice visible | `shell.contract.test.ts > shows shell notice for study status` | ✅ COMPLIANT |

**Compliance summary**: 18/18 scenarios compliant

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| Study JSON | ✅ Implemented | validateDataset + chama-study.json (10 sites) |
| Cover / Prevalence / Ficha band / Manual | ✅ Implemented | incidencia Alto≥70% / Medio≥40% / Bajo<40%; Benavides 1/12 poor |
| Chama Boundary | ✅ Implemented | chama-boundary.geojson + boundaryGeometry + render path |
| Semáforo / Heat / Legend / Provisional | ✅ Implemented | map/ui modules + covering tests |
| Static SPA / Maps key / empty-error | ✅ Implemented | base './', readEnv, statusFromValidation |
| Local-only README | ✅ Implemented | science-fair localhost; file:// unsupported |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| Vite+TS vanilla, base './' | ✅ Yes | |
| deck.gl HeatmapLayer via GoogleMapsOverlay | ✅ Yes | heatOverlay.ts |
| Hand-written validation | ✅ Yes | |
| Ficha incidencia thresholds in config | ✅ Yes | code matches openspec; design prose still lists old cover/morphology rules |
| Vitest covering domain + shell/map contracts | ✅ Yes | 30 tests; no live Maps in CI |
| Maps script-tag bootstrap | ⚠️ Deviation | bootstrap uses script tag; @googlemaps/js-api-loader unused |

### Issues Found
**CRITICAL**: None

**WARNING**:
1. Design artifact (`design.md` / Engram design) still documents pre-ficha derivation (cover/morphology bands); openspec + code use incidencia-only ficha rules — design coherence drift
2. Engram `sdd/chama-lichen-heatmap/spec` is stale (old 2/12 + cover-band rules) vs openspec delta specs used for this verify
3. Manual Maps checklist in README was not executed in this session (no live API key / browser Maps smoke)
4. Production heatOverlay chunk exceeds 500 kB (build warning only; lazy-loaded)

**SUGGESTION**:
1. Sync Engram spec artifact to openspec ficha deltas before archive
2. Update design.md derivation section to ficha incidencia bands
3. Optional: mock `attachHeatOverlay` end-to-end with GoogleMapsOverlay stub

### Verdict
PASS WITH WARNINGS
18/18 scenarios have passing covering tests; npm test (30) and npm run build green. Archive allowed; address design/Engram sync warnings when convenient.
