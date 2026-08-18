# map-visualization Specification

## Requirements

### Requirement: Chama Boundary

MUST render Google Maps and Chama boundary (Higuereta, Benavides, Valle del Sur, Aviación).

#### Scenario: Boundary visible

- GIVEN Maps and boundary load
- WHEN map initializes
- THEN Chama boundary MUST be visible

### Requirement: Semáforo Default

Default MUST style sites by effective `airQualityBand` (`good`|`moderate`|`poor`); heat optional.

#### Scenario: Default semáforo

- GIVEN valid multi-site dataset
- WHEN map opens with no preference
- THEN semáforo MUST be active

### Requirement: Optional Heat

MUST toggle deck.gl `HeatmapLayer` via `GoogleMapsOverlay` (not Maps HeatmapLayer) from study weights.

#### Scenario: Heat from study

- GIVEN default view and conforming data
- WHEN heat enabled
- THEN heat MUST use study weights

### Requirement: Legend

MUST show legend for semáforo; include heat when enabled.

#### Scenario: Semáforo legend

- GIVEN default view
- WHEN UI renders
- THEN legend MUST explain good, moderate, poor

### Requirement: Provisional Label

Map UI MUST label dataset as provisional.

#### Scenario: Label visible

- GIVEN provisional JSON
- WHEN map UI renders
- THEN provisional label MUST be visible
