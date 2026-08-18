# lichen-dataset Specification

## Requirements

### Requirement: Study JSON

MUST accept JSON with `schemaVersion`, `study`, `sites[]`. Site MUST include `id`, `name`, `kind` (`park`|`avenue`|`other`), `location{lat,lng}`, `trafficExposure` (`low`|`medium`|`high`), optional `notes`, required `sampling`+`pollutionProxy`, optional `observations[]` (not for map math).

#### Scenario: Observations optional

- GIVEN sampling + pollutionProxy, no observations
- WHEN dataset loads
- THEN site MUST be accepted for map math

#### Scenario: Missing sampling

- GIVEN site without sampling
- WHEN validated
- THEN MUST reject for map rendering

### Requirement: Cover Over Lichen Trees

When `avgCoverByMorphology` is provided, values MUST average over `treesWithLichen` only; non-lichen trees MUST NOT enter cover means but MUST count in `treesExamined`. Cover MAY be zero when not measured in the field sheet.

#### Scenario: Exclude zero-lichen from cover

- GIVEN 10 examined, 2 with lichen, crustose covers 10% and 6%
- WHEN interpreted
- THEN crustose average MUST be 8

### Requirement: Prevalence Formula

`prevalence` (incidencia) MUST equal `treesWithLichen / treesExamined` (`treesExamined` > 0).

#### Scenario: Prevalence 1/12

- GIVEN 12 examined, 1 with lichen (Av. Benavides ficha)
- WHEN computed
- THEN prevalence MUST equal 1/12

### Requirement: Derived Presence Band (Semáforo)

Band MUST follow ficha técnica incidencia legend: `good` (Alto) if prevalence ≥ 0.70; `moderate` (Medio) if prevalence ≥ 0.40 and < 0.70; `poor` (Bajo) if prevalence < 0.40. Cover/morphology MUST NOT alter the band when using ficha rules.

#### Scenario: Benavides poor

- GIVEN Av Benavides: 12 examined, 1 with lichen, derived
- WHEN derived
- THEN band MUST be `poor`

#### Scenario: Alto conditions

- GIVEN prevalence ≥ 0.70 (e.g. Parque La Coruña 20/20)
- WHEN derived
- THEN band MUST be `good`

#### Scenario: Medio conditions

- GIVEN prevalence in [0.40, 0.70) (e.g. Santos Chocano 4/6)
- WHEN derived
- THEN band MUST be `moderate`

### Requirement: Manual Override

If `basis`=`manual` and band present, that band MUST override derivation.

#### Scenario: Manual wins

- GIVEN derived-poor sampling, basis manual, band moderate
- WHEN resolved
- THEN band MUST be moderate
